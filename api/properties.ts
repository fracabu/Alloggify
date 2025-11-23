/**
 * Properties API - Multi-Property Management
 * Endpoint: /api/properties
 *
 * Handles CRUD operations for user properties with:
 * - Property limit enforcement (based on subscription plan)
 * - WSKEY encryption/decryption
 * - Default property management
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { requireAuth } from '../lib/auth';
import { encryptWskey, decryptWskey } from '../lib/encryption';
import { getPropertyLimit, canAddProperty } from '../lib/pricing';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Require authentication
  const user = await requireAuth(req, res);
  if (!user) return; // Response already sent by requireAuth

  try {
    // GET: List user properties
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT
          id,
          property_name,
          property_type,
          address,
          city,
          province,
          alloggiati_username,
          is_default,
          last_used_at,
          total_submissions,
          notes,
          created_at
        FROM properties
        WHERE user_id = ${user.id}
        ORDER BY is_default DESC, property_name ASC
      `;

      // Get user's property limit
      const propertyLimit = getPropertyLimit(user.subscription_plan);
      const canAdd = canAddProperty(user.subscription_plan, rows.length);

      return res.status(200).json({
        properties: rows,
        count: rows.length,
        limit: propertyLimit,
        canAddMore: canAdd
      });
    }

    // POST: Add new property
    if (req.method === 'POST') {
      const {
        propertyName,
        propertyType,
        address,
        city,
        province,
        wskey,
        alloggiatiUsername,
        notes,
        setAsDefault
      } = req.body;

      // Validation
      if (!propertyName || !wskey || !alloggiatiUsername) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['propertyName', 'wskey', 'alloggiatiUsername']
        });
      }

      // Check property limit
      const propertyLimit = getPropertyLimit(user.subscription_plan);
      const { rows: countRows } = await sql`
        SELECT COUNT(*) as count
        FROM properties
        WHERE user_id = ${user.id}
      `;
      const currentCount = parseInt(countRows[0].count);

      if (currentCount >= propertyLimit) {
        return res.status(403).json({
          error: 'Limite strutture raggiunto',
          details: {
            currentPlan: user.subscription_plan,
            currentCount: currentCount,
            limit: propertyLimit,
            message:
              propertyLimit === 1
                ? 'Il piano FREE permette solo 1 struttura. Passa a STARTER per gestire fino a 5 strutture.'
                : propertyLimit === 5
                ? 'Il piano STARTER permette max 5 strutture. Passa a PRO per strutture illimitate.'
                : `Hai raggiunto il limite di ${propertyLimit} strutture.`,
            upgradeUrl: '/upgrade'
          }
        });
      }

      // Encrypt WSKEY
      const wskeyEncrypted = encryptWskey(wskey);

      // If this is the first property OR setAsDefault is true, make it default
      const isFirstProperty = currentCount === 0;
      const shouldBeDefault = isFirstProperty || setAsDefault === true;

      // If setting as default, unset other defaults
      if (shouldBeDefault) {
        await sql`
          UPDATE properties
          SET is_default = FALSE
          WHERE user_id = ${user.id}
        `;
      }

      // Insert new property
      const { rows } = await sql`
        INSERT INTO properties (
          user_id,
          property_name,
          property_type,
          address,
          city,
          province,
          wskey_encrypted,
          alloggiati_username,
          notes,
          is_default
        )
        VALUES (
          ${user.id},
          ${propertyName},
          ${propertyType || null},
          ${address || null},
          ${city || null},
          ${province || null},
          ${wskeyEncrypted},
          ${alloggiatiUsername},
          ${notes || null},
          ${shouldBeDefault}
        )
        RETURNING id, property_name, is_default, created_at
      `;

      console.log(`[Properties] Property added: ${propertyName} (user: ${user.email})`);

      return res.status(201).json({
        success: true,
        property: rows[0],
        message: `Struttura "${propertyName}" aggiunta con successo`
      });
    }

    // PUT: Update property
    if (req.method === 'PUT') {
      const {
        propertyId,
        propertyName,
        propertyType,
        address,
        city,
        province,
        wskey, // Optional: only if updating credentials
        alloggiatiUsername,
        notes,
        setAsDefault
      } = req.body;

      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID required' });
      }

      // Verify ownership
      const { rows: ownerCheck } = await sql`
        SELECT id FROM properties
        WHERE id = ${propertyId} AND user_id = ${user.id}
      `;

      if (ownerCheck.length === 0) {
        return res.status(404).json({ error: 'Struttura non trovata' });
      }

      // If setting as default, unset others
      if (setAsDefault === true) {
        await sql`
          UPDATE properties
          SET is_default = FALSE
          WHERE user_id = ${user.id}
        `;
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];

      if (propertyName) {
        updates.push(`property_name = $${updates.length + 1}`);
        values.push(propertyName);
      }
      if (propertyType !== undefined) {
        updates.push(`property_type = $${updates.length + 1}`);
        values.push(propertyType);
      }
      if (address !== undefined) {
        updates.push(`address = $${updates.length + 1}`);
        values.push(address);
      }
      if (city !== undefined) {
        updates.push(`city = $${updates.length + 1}`);
        values.push(city);
      }
      if (province !== undefined) {
        updates.push(`province = $${updates.length + 1}`);
        values.push(province);
      }
      if (wskey) {
        const wskeyEncrypted = encryptWskey(wskey);
        updates.push(`wskey_encrypted = $${updates.length + 1}`);
        values.push(wskeyEncrypted);
      }
      if (alloggiatiUsername) {
        updates.push(`alloggiati_username = $${updates.length + 1}`);
        values.push(alloggiatiUsername);
      }
      if (notes !== undefined) {
        updates.push(`notes = $${updates.length + 1}`);
        values.push(notes);
      }
      if (setAsDefault !== undefined) {
        updates.push(`is_default = $${updates.length + 1}`);
        values.push(setAsDefault);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      // Execute update (using raw query for dynamic updates)
      await sql.query(
        `UPDATE properties
         SET ${updates.join(', ')}, updated_at = NOW()
         WHERE id = $${updates.length + 1} AND user_id = $${updates.length + 2}`,
        [...values, propertyId, user.id]
      );

      console.log(`[Properties] Property updated: ${propertyId} (user: ${user.email})`);

      return res.status(200).json({
        success: true,
        message: 'Struttura aggiornata con successo'
      });
    }

    // DELETE: Remove property
    if (req.method === 'DELETE') {
      const { propertyId } = req.body;

      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID required' });
      }

      // Verify ownership and get info
      const { rows: propertyRows } = await sql`
        SELECT property_name, is_default
        FROM properties
        WHERE id = ${propertyId} AND user_id = ${user.id}
      `;

      if (propertyRows.length === 0) {
        return res.status(404).json({ error: 'Struttura non trovata' });
      }

      const wasDefault = propertyRows[0].is_default;
      const propertyName = propertyRows[0].property_name;

      // Delete property
      await sql`
        DELETE FROM properties
        WHERE id = ${propertyId} AND user_id = ${user.id}
      `;

      // If deleted property was default, set another as default
      if (wasDefault) {
        await sql`
          UPDATE properties
          SET is_default = TRUE
          WHERE user_id = ${user.id}
          ORDER BY created_at ASC
          LIMIT 1
        `;
      }

      console.log(`[Properties] Property deleted: ${propertyName} (user: ${user.email})`);

      return res.status(200).json({
        success: true,
        message: `Struttura "${propertyName}" eliminata con successo`
      });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[Properties API] Error:', error);
    return res.status(500).json({
      error: 'Errore server',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
