/**
 * User Data API - Profile, Receipts, Subscription
 * Endpoint: /api/user?resource=<resource>&action=<action>
 *
 * Consolidates user-related data endpoints
 *
 * Resources:
 * - profile: User profile information
 * - receipts: Receipt management (list, download, bulk)
 * - subscription: Subscription and usage information
 * - scans: Scan history
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { requireAuth } from '../lib/auth';
import archiver from 'archiver';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Require authentication
  const user = await requireAuth(req, res);
  if (!user) return;

  // Get resource from query params
  const resource = (req.query.resource as string)?.toLowerCase();
  const action = (req.query.action as string)?.toLowerCase();

  if (!resource) {
    return res.status(400).json({
      error: 'Missing resource parameter',
      message: 'Specify ?resource=profile|receipts|subscription|scans'
    });
  }

  try {
    // Route to appropriate handler
    switch (resource) {
      case 'profile':
        return await handleProfile(req, res, user);
      case 'receipts':
        return await handleReceipts(req, res, user, action);
      case 'subscription':
        return await handleSubscription(req, res, user);
      case 'scans':
        return await handleScans(req, res, user);
      default:
        return res.status(400).json({
          error: 'Invalid resource',
          message: `Unknown resource: ${resource}`
        });
    }
  } catch (error: any) {
    console.error(`[User API] Error in resource "${resource}":`, error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Errore del server. Riprova più tardi.'
    });
  }
}

// ============================================
// PROFILE HANDLER
// ============================================
async function handleProfile(req: VercelRequest, res: VercelResponse, user: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get full user data
  const { rows } = await sql`
    SELECT
      id,
      email,
      full_name,
      company_name,
      subscription_plan,
      subscription_status,
      stripe_customer_id,
      stripe_subscription_id,
      scan_count,
      monthly_scan_limit,
      property_limit,
      email_verified,
      created_at,
      last_login_at,
      last_scan_reset_at
    FROM users
    WHERE id = ${user.id}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({
    profile: rows[0]
  });
}

// ============================================
// RECEIPTS HANDLER
// ============================================
async function handleReceipts(req: VercelRequest, res: VercelResponse, user: any, action?: string) {
  // List receipts
  if (req.method === 'GET' && !action) {
    const {
      limit = '50',
      offset = '0',
      guestSurname,
      startDate,
      endDate,
      propertyId
    } = req.query;

    // Build query dynamically based on filters
    let query = `
      SELECT
        r.id,
        r.receipt_number,
        r.receipt_date,
        r.guest_name,
        r.guest_surname,
        r.guest_nationality,
        r.property_name,
        r.property_id,
        r.checkin_date,
        r.checkout_date,
        r.nights,
        r.file_size,
        r.created_at
      FROM receipts r
      WHERE r.user_id = $1
    `;

    const params: any[] = [user.id];
    let paramIndex = 2;

    // Filter by guest surname
    if (guestSurname && typeof guestSurname === 'string') {
      query += ` AND r.guest_surname ILIKE $${paramIndex}`;
      params.push(`%${guestSurname}%`);
      paramIndex++;
    }

    // Filter by date range
    if (startDate && typeof startDate === 'string') {
      query += ` AND r.receipt_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate && typeof endDate === 'string') {
      query += ` AND r.receipt_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    // Filter by property
    if (propertyId && typeof propertyId === 'string') {
      query += ` AND r.property_id = $${paramIndex}`;
      params.push(propertyId);
      paramIndex++;
    }

    // Order and pagination
    query += ` ORDER BY r.receipt_date DESC, r.created_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const { rows } = await sql.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM receipts WHERE user_id = $1`;
    const countParams: any[] = [user.id];
    const { rows: countRows } = await sql.query(countQuery, countParams);

    return res.status(200).json({
      receipts: rows,
      total: parseInt(countRows[0].total),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  }

  // Download single receipt
  if (req.method === 'GET' && action === 'download') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Receipt ID required' });
    }

    // Get receipt
    const { rows } = await sql`
      SELECT
        receipt_number,
        receipt_pdf_base64,
        guest_surname,
        guest_name,
        receipt_date
      FROM receipts
      WHERE id = ${id} AND user_id = ${user.id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ricevuta non trovata' });
    }

    const receipt = rows[0];

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(receipt.receipt_pdf_base64, 'base64');

    // Set headers for PDF download
    const filename = `ricevuta_${receipt.receipt_number}_${receipt.guest_surname || 'ospite'}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  }

  // Bulk download receipts as ZIP
  if (req.method === 'POST' && action === 'bulk') {
    const { receiptIds } = req.body;

    if (!receiptIds || !Array.isArray(receiptIds) || receiptIds.length === 0) {
      return res.status(400).json({ error: 'Receipt IDs array required' });
    }

    // Limit bulk download to 50 receipts
    if (receiptIds.length > 50) {
      return res.status(400).json({
        error: 'Too many receipts',
        message: 'Puoi scaricare max 50 ricevute alla volta'
      });
    }

    // Get receipts
    const { rows } = await sql`
      SELECT
        id,
        receipt_number,
        receipt_pdf_base64,
        guest_surname,
        receipt_date
      FROM receipts
      WHERE id = ANY(${receiptIds}) AND user_id = ${user.id}
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nessuna ricevuta trovata' });
    }

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Set headers for ZIP download
    const zipFilename = `ricevute_${new Date().toISOString().split('T')[0]}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

    // Pipe archive to response
    archive.pipe(res);

    // Add PDFs to archive
    for (const receipt of rows) {
      const pdfBuffer = Buffer.from(receipt.receipt_pdf_base64, 'base64');
      const filename = `${receipt.receipt_number}_${receipt.guest_surname || 'ospite'}.pdf`;
      archive.append(pdfBuffer, { name: filename });
    }

    // Finalize archive
    await archive.finalize();

    return; // Response already sent via pipe
  }

  return res.status(400).json({ error: 'Invalid action for receipts' });
}

// ============================================
// SUBSCRIPTION HANDLER
// ============================================
async function handleSubscription(req: VercelRequest, res: VercelResponse, user: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user subscription data
  const { rows: userRows } = await sql`
    SELECT
      subscription_plan,
      subscription_status,
      stripe_customer_id,
      stripe_subscription_id,
      scan_count,
      monthly_scan_limit,
      property_limit,
      last_scan_reset_at
    FROM users
    WHERE id = ${user.id}
    LIMIT 1
  `;

  if (userRows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userData = userRows[0];

  // Get subscription details from Stripe if available
  let stripeSubscription = null;
  if (userData.stripe_subscription_id) {
    const { rows: subRows } = await sql`
      SELECT
        plan_name,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        cancelled_at
      FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (subRows.length > 0) {
      stripeSubscription = subRows[0];
    }
  }

  // Get property count
  const { rows: propRows } = await sql`
    SELECT COUNT(*) as count
    FROM properties
    WHERE user_id = ${user.id}
  `;
  const propertyCount = parseInt(propRows[0].count);

  // Calculate usage percentage
  const usagePercentage = (userData.scan_count / userData.monthly_scan_limit) * 100;

  return res.status(200).json({
    subscription: {
      plan: userData.subscription_plan,
      status: userData.subscription_status,
      scanCount: userData.scan_count,
      monthlyScanLimit: userData.monthly_scan_limit,
      usagePercentage: Math.round(usagePercentage),
      propertyCount: propertyCount,
      propertyLimit: userData.property_limit,
      lastResetAt: userData.last_scan_reset_at,
      stripeDetails: stripeSubscription
    }
  });
}

// ============================================
// SCANS HANDLER
// ============================================
async function handleScans(req: VercelRequest, res: VercelResponse, user: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    limit = '50',
    offset = '0',
    propertyId,
    submitted
  } = req.query;

  // Build query
  let query = `
    SELECT
      s.id,
      s.document_type,
      s.extracted_data,
      s.processing_time_ms,
      s.success,
      s.submitted_to_alloggiati,
      s.submission_receipt_number,
      s.submission_date,
      s.property_id,
      s.created_at,
      p.property_name
    FROM scans s
    LEFT JOIN properties p ON s.property_id = p.id
    WHERE s.user_id = $1
  `;

  const params: any[] = [user.id];
  let paramIndex = 2;

  // Filter by property
  if (propertyId && typeof propertyId === 'string') {
    query += ` AND s.property_id = $${paramIndex}`;
    params.push(propertyId);
    paramIndex++;
  }

  // Filter by submission status
  if (submitted !== undefined) {
    const isSubmitted = submitted === 'true';
    query += ` AND s.submitted_to_alloggiati = $${paramIndex}`;
    params.push(isSubmitted);
    paramIndex++;
  }

  // Order and pagination
  query += ` ORDER BY s.created_at DESC`;
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(parseInt(limit as string), parseInt(offset as string));

  const { rows } = await sql.query(query, params);

  // Get total count
  const { rows: countRows } = await sql`
    SELECT COUNT(*) as total FROM scans WHERE user_id = ${user.id}
  `;

  return res.status(200).json({
    scans: rows,
    total: parseInt(countRows[0].total),
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });
}
