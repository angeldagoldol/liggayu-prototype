const dateFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });
const numberFormatter = new Intl.NumberFormat('en');
const compactFormatter = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

export function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

export function formatNumber(value) {
  return numberFormatter.format(value);
}

export function formatCompact(value) {
  return compactFormatter.format(value);
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Zero-padded page counter: 3 -> "03". */
export function pad(value, length = 2) {
  return String(value).padStart(length, '0');
}

/** Roughly estimate reading time from a brochure's text content. */
export function estimateReadMinutes(brochure) {
  const text = JSON.stringify(brochure?.pages ?? []);
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
