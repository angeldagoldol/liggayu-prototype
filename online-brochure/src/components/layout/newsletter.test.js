import { describe, expect, it } from 'vitest';
import { validateEmail } from './newsletter.js';

describe('validateEmail', () => {
  it('asks for an address when empty', () => {
    expect(validateEmail('')).toMatch(/enter your email/i);
    expect(validateEmail('   ')).toMatch(/enter your email/i);
    expect(validateEmail(undefined)).toMatch(/enter your email/i);
  });

  it('rejects malformed addresses', () => {
    for (const bad of ['hanako', 'hanako@', '@tabi.example', 'hanako@tabi', 'ha nako@tabi.example', 'a@b.c']) {
      expect(validateEmail(bad)).toMatch(/doesn’t look like/);
    }
  });

  it('accepts reasonable addresses, trimming whitespace', () => {
    expect(validateEmail('hanako@tabi.example')).toBe('');
    expect(validateEmail('  ken.sato+letters@mail.tabi.example  ')).toBe('');
  });
});
