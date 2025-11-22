/**
 * Database Utilities
 * Vercel Postgres connection and helper functions
 */

import { sql } from '@vercel/postgres';
// import { kv } from '@vercel/kv'; // TODO: Uncomment when Vercel KV is configured

/**
 * Database connection is automatically handled by @vercel/postgres
 * using environment variables:
 * - POSTGRES_URL
 * - POSTGRES_PRISMA_URL
 * - POSTGRES_URL_NON_POOLING
 *
 * These are auto-configured when you add Vercel Postgres to your project
 */

// Export sql for direct queries
export { sql };
// export { kv }; // TODO: Uncomment when Vercel KV is configured

/**
 * Helper: Get user by email
 */
export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;
  return result.rows[0] || null;
}

/**
 * Helper: Get user by ID
 */
export async function getUserById(id: string) {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `;
  return result.rows[0] || null;
}

/**
 * Helper: Create new user
 */
export async function createUser(data: {
  email: string;
  passwordHash: string | null;
  fullName: string;
  companyName?: string | null;
  verificationToken?: string | null;
  emailVerified?: boolean;
  googleId?: string | null;
}) {
  const result = await sql`
    INSERT INTO users (
      email,
      password_hash,
      full_name,
      company_name,
      verification_token,
      verification_token_expires,
      email_verified,
      google_id
    ) VALUES (
      ${data.email},
      ${data.passwordHash},
      ${data.fullName},
      ${data.companyName || null},
      ${data.verificationToken || null},
      ${data.verificationToken ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null},
      ${data.emailVerified || false},
      ${data.googleId || null}
    )
    RETURNING id, email, full_name, company_name, subscription_plan, monthly_scan_limit, email_verified, created_at
  `;
  return result.rows[0];
}

/**
 * Helper: Update user email verification status
 */
export async function verifyUserEmail(token: string) {
  const result = await sql`
    UPDATE users
    SET
      email_verified = TRUE,
      verification_token = NULL,
      verification_token_expires = NULL,
      updated_at = NOW()
    WHERE
      verification_token = ${token}
      AND verification_token_expires > NOW()
    RETURNING id, email, email_verified
  `;
  return result.rows[0] || null;
}

/**
 * Helper: Set password reset token
 */
export async function setPasswordResetToken(email: string, token: string) {
  const result = await sql`
    UPDATE users
    SET
      reset_password_token = ${token},
      reset_password_expires = NOW() + INTERVAL '1 hour',
      updated_at = NOW()
    WHERE email = ${email}
    RETURNING id, email
  `;
  return result.rows[0] || null;
}

/**
 * Helper: Reset password with token
 */
export async function resetPassword(token: string, newPasswordHash: string) {
  const result = await sql`
    UPDATE users
    SET
      password_hash = ${newPasswordHash},
      reset_password_token = NULL,
      reset_password_expires = NULL,
      updated_at = NOW()
    WHERE
      reset_password_token = ${token}
      AND reset_password_expires > NOW()
    RETURNING id, email
  `;
  return result.rows[0] || null;
}

/**
 * Helper: Update last login timestamp
 */
export async function updateLastLogin(userId: string) {
  await sql`
    UPDATE users
    SET last_login_at = NOW()
    WHERE id = ${userId}
  `;
}

/**
 * Helper: Increment scan count
 */
export async function incrementScanCount(userId: string) {
  const result = await sql`
    UPDATE users
    SET scan_count = scan_count + 1
    WHERE id = ${userId}
    RETURNING scan_count, monthly_scan_limit
  `;
  return result.rows[0];
}

/**
 * Helper: Check if user has reached scan limit
 */
export async function hasReachedScanLimit(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT scan_count, monthly_scan_limit
    FROM users
    WHERE id = ${userId}
  `;

  if (result.rows.length === 0) return true;

  const { scan_count, monthly_scan_limit } = result.rows[0];
  return scan_count >= monthly_scan_limit;
}

/**
 * Helper: Log scan
 */
export async function logScan(data: {
  userId: string;
  documentType: string;
  extractedData: any;
  processingTimeMs: number;
  success: boolean;
  errorMessage?: string;
}) {
  const result = await sql`
    INSERT INTO scans (
      user_id,
      document_type,
      extracted_data,
      processing_time_ms,
      success,
      error_message
    ) VALUES (
      ${data.userId},
      ${data.documentType},
      ${JSON.stringify(data.extractedData)},
      ${data.processingTimeMs},
      ${data.success},
      ${data.errorMessage || null}
    )
    RETURNING id, created_at
  `;
  return result.rows[0];
}

/**
 * Helper: Get user's scan history
 */
export async function getUserScans(userId: string, limit = 10) {
  const result = await sql`
    SELECT
      id,
      document_type,
      extracted_data,
      success,
      created_at
    FROM scans
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return result.rows;
}

/**
 * Helper: Log user action (for analytics)
 */
export async function logUserAction(data: {
  userId?: string;
  action: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  await sql`
    INSERT INTO usage_logs (
      user_id,
      action,
      metadata,
      ip_address,
      user_agent
    ) VALUES (
      ${data.userId || null},
      ${data.action},
      ${data.metadata ? JSON.stringify(data.metadata) : null},
      ${data.ipAddress || null},
      ${data.userAgent || null}
    )
  `;
}
