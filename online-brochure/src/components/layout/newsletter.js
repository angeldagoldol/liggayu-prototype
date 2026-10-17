/** Newsletter sign-up validation (the "Seasonal letters" footer form). */

// Pragmatic, not RFC 5322: something@something.tld, no spaces.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns an error message, or '' when the address is acceptable. */
export function validateEmail(value) {
  const email = String(value ?? '').trim();
  if (!email) return 'Enter your email address.';
  if (email.length > 254 || !EMAIL.test(email)) return 'That doesn’t look like an email address — check for typos.';
  return '';
}
