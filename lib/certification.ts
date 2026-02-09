import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface CertificationStatus {
  is_certified: boolean;
  certification_type?: 'high_net_worth' | 'sophisticated';
  valid_until?: string;
  requires_veriff?: boolean;
  certification_id?: string;
}

export interface PurchaseEligibility {
  allowed: boolean;
  reason?: string;
  certification?: CertificationStatus;
}

/**
 * Get the current valid certification for a user
 */
export async function getCertification(userId: string): Promise<CertificationStatus | null> {
  const { data: certification, error } = await supabase
    .from('investor_certifications')
    .select('id, certification_type, valid_until, veriff_status')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .gt('valid_until', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !certification) {
    return null;
  }

  return {
    is_certified: true,
    certification_type: certification.certification_type,
    valid_until: certification.valid_until,
    requires_veriff: certification.veriff_status !== 'approved',
    certification_id: certification.id,
  };
}

/**
 * Check if a user can purchase shares/tokens
 *
 * @param userId - The user's ID
 * @param amount - The purchase amount in GBP
 * @param veriffThreshold - Amount above which Veriff verification is required (default £10,000)
 */
export async function canPurchaseShares(
  userId: string,
  amount: number,
  veriffThreshold: number = 10000
): Promise<PurchaseEligibility> {
  // 1. Check for valid certification
  const certification = await getCertification(userId);

  if (!certification || !certification.is_certified) {
    return {
      allowed: false,
      reason: 'No investor certification found. Please complete investor certification first.',
      certification: { is_certified: false },
    };
  }

  // 2. Check if certification is expired
  if (certification.valid_until && new Date(certification.valid_until) < new Date()) {
    return {
      allowed: false,
      reason: 'Your investor certification has expired. Please recertify.',
      certification,
    };
  }

  // 3. Check Veriff status for high-value purchases
  if (amount > veriffThreshold && certification.requires_veriff) {
    return {
      allowed: false,
      reason: `Identity verification (Veriff) is required for purchases over £${veriffThreshold.toLocaleString()}.`,
      certification,
    };
  }

  return {
    allowed: true,
    certification,
  };
}

/**
 * Revoke an investor certification
 */
export async function revokeCertification(
  certificationId: string,
  reason: string
): Promise<boolean> {
  const { error } = await supabase
    .from('investor_certifications')
    .update({
      revoked_at: new Date().toISOString(),
      revocation_reason: reason,
    })
    .eq('id', certificationId);

  return !error;
}

/**
 * Get certifications expiring soon (for reminder emails)
 *
 * @param daysBeforeExpiry - Number of days before expiry to check
 */
export async function getExpiringCertifications(daysBeforeExpiry: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysBeforeExpiry);

  const { data: certifications, error } = await supabase
    .from('investor_certifications')
    .select(`
      id,
      user_id,
      certification_type,
      valid_until,
      full_name,
      users (
        email
      )
    `)
    .is('revoked_at', null)
    .gt('valid_until', new Date().toISOString())
    .lt('valid_until', futureDate.toISOString());

  if (error) {
    console.error('Error fetching expiring certifications:', error);
    return [];
  }

  return certifications || [];
}

/**
 * Get certification statistics (for admin dashboard)
 */
export async function getCertificationStats() {
  const now = new Date().toISOString();

  // Get counts by type and status
  const { data: stats, error } = await supabase
    .from('investor_certifications')
    .select('certification_type, valid_until, revoked_at');

  if (error || !stats) {
    return {
      total: 0,
      active: 0,
      expired: 0,
      revoked: 0,
      high_net_worth: 0,
      sophisticated: 0,
    };
  }

  const active = stats.filter(s => !s.revoked_at && new Date(s.valid_until) > new Date());
  const expired = stats.filter(s => !s.revoked_at && new Date(s.valid_until) <= new Date());
  const revoked = stats.filter(s => s.revoked_at);

  return {
    total: stats.length,
    active: active.length,
    expired: expired.length,
    revoked: revoked.length,
    high_net_worth: active.filter(s => s.certification_type === 'high_net_worth').length,
    sophisticated: active.filter(s => s.certification_type === 'sophisticated').length,
  };
}
