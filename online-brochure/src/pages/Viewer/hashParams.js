/**
 * Set (or with `value === null`, remove) one query parameter inside a
 * hash-router URL fragment: "#/brochures/kyoto?p=3" → "#/brochures/kyoto?p=4".
 * Other parameters keep their order.
 */
export function withHashParam(hash, name, value) {
  const raw = String(hash ?? '').replace(/^#/, '');
  const at = raw.indexOf('?');
  const path = at === -1 ? raw : raw.slice(0, at);
  const params = new URLSearchParams(at === -1 ? '' : raw.slice(at + 1));
  if (value === null || value === undefined) params.delete(name);
  else params.set(name, value);
  const query = params.toString();
  return `#${path || '/'}${query ? `?${query}` : ''}`;
}
