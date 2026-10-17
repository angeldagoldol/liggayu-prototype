import { describe, expect, it } from 'vitest';
import { withHashParam } from './hashParams.js';

describe('withHashParam', () => {
  it('adds a parameter to a hash route', () => {
    expect(withHashParam('#/brochures/kyoto', 'p', '4')).toBe('#/brochures/kyoto?p=4');
  });

  it('replaces an existing value and keeps the others in order', () => {
    expect(withHashParam('#/brochures/kyoto?ref=home&p=3', 'p', '7')).toBe('#/brochures/kyoto?ref=home&p=7');
  });

  it('removes the parameter (and a now-empty query)', () => {
    expect(withHashParam('#/brochures/kyoto?p=3', 'p', null)).toBe('#/brochures/kyoto');
    expect(withHashParam('#/brochures/kyoto?ref=x&p=3', 'p', null)).toBe('#/brochures/kyoto?ref=x');
  });

  it('copes with an empty hash', () => {
    expect(withHashParam('', 'p', '2')).toBe('#/?p=2');
  });
});
