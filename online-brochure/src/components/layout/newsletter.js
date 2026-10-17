/** Newsletter sign-up validation (the "Seasonal letters" footer form). */
import { isEmail } from '../../lib/format.js';

/** Returns an error message, or '' when the address is acceptable. */
export function validateEmail(value) {
  const email = String(value ?? '').trim();
  if (!email) return 'Enter your email address.';
  if (!isEmail(email)) return 'That doesn’t look like an email address — check for typos.';
  return '';
}
