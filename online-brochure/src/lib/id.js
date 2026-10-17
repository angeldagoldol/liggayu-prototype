/** Short random id, e.g. createId('pg') -> "pg_k3j9x2ab". */
export function createId(prefix = 'id') {
  const random =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${random}`;
}

/** "Hello, Wörld!" -> "hello-world" */
export function slugify(input) {
  return String(input ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

/** Make `base` unique against a set/array of taken slugs by appending -2, -3… */
export function uniqueSlug(base, taken) {
  const takenSet = taken instanceof Set ? taken : new Set(taken);
  const root = slugify(base) || 'untitled';
  if (!takenSet.has(root)) return root;
  let n = 2;
  while (takenSet.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}
