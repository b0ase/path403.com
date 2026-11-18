// RETIRED 18 Nov 2026 (security). This route trusted an unauthenticated header (x-wallet-handle / an admin or
// bridge secret that passes when unset) to hand out keys or move value. Its body is deleted on purpose; it answers
// 410 to every method. Do not restore it: rebuild it behind real authentication if it is ever needed again.
import { retired } from '@/lib/retired';

export const POST = retired;
