/**
 * "Plan this trip" inquiry: options, sensible defaults, validation and the
 * record saved to localStorage. Pure, so the form stays a thin view.
 */
import { isEmail } from '../../lib/format.js';

export const MAX_TRAVELLERS = 12;
export const MESSAGE_LIMIT = 1000;
export const MAX_SAVED_INQUIRIES = 50;

/** What a traveller can ask for, each with a one-kanji mark. */
export const INTERESTS = [
  { id: 'food', label: 'Food & drink', jp: '食' },
  { id: 'temples', label: 'Temples & shrines', jp: '寺' },
  { id: 'nature', label: 'Nature & hiking', jp: '山' },
  { id: 'onsen', label: 'Onsen', jp: '湯' },
  { id: 'nightlife', label: 'Nightlife', jp: '夜' },
  { id: 'festivals', label: 'Festivals', jp: '祭' },
  { id: 'craft', label: 'Art & craft', jp: '匠' },
  { id: 'coast', label: 'Islands & coast', jp: '海' },
];

const INTEREST_IDS = new Set(INTERESTS.map((i) => i.id));

/** Brochure category → the interest it implies, pre-selected in the form. */
const CATEGORY_INTEREST = {
  cities: 'nightlife',
  heritage: 'temples',
  nature: 'nature',
  islands: 'coast',
  food: 'food',
  onsen: 'onsen',
  festivals: 'festivals',
  craft: 'craft',
};

/** Japan's seasons by calendar month (0 = January), as in data/seasons.js. */
const MONTH_SEASON = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];

const monthLabel = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** The `count` calendar months after `now`: [{ value: '2026-11', label: 'November 2026', season }]. */
export function upcomingMonths(now = new Date(), count = 12) {
  const year = now.getFullYear();
  const month = now.getMonth();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(year, month + 1 + i, 1));
    const m = date.getUTCMonth();
    return {
      value: `${date.getUTCFullYear()}-${String(m + 1).padStart(2, '0')}`,
      label: monthLabel.format(date),
      season: MONTH_SEASON[m],
    };
  });
}

/** First upcoming month in one of the brochure's best seasons (else the first month). */
export function suggestMonth(months, seasons = []) {
  const wanted = new Set(Array.isArray(seasons) ? seasons : []);
  return (months.find((m) => wanted.has(m.season)) ?? months[0])?.value ?? '';
}

/** Initial form values for a brochure. */
export function initialInquiry(brochure, months) {
  const interest = CATEGORY_INTEREST[brochure?.category];
  return {
    name: '',
    email: '',
    month: suggestMonth(months, brochure?.seasons),
    travellers: 2,
    interests: interest ? [interest] : [],
    message: '',
  };
}

/** Field errors keyed by field name; an empty object means valid. */
export function validateInquiry(values, months) {
  const errors = {};
  const name = String(values.name ?? '').trim();
  const email = String(values.email ?? '').trim();
  const travellers = Number(values.travellers);
  const message = String(values.message ?? '');

  if (name.length === 0) errors.name = 'Tell us what to call you.';
  else if (name.length < 2) errors.name = 'That name looks a little short.';

  if (email.length === 0) errors.email = 'We need an email to send your itinerary to.';
  else if (!isEmail(email)) errors.email = 'That email address doesn’t look right — check for typos.';

  if (!months.some((m) => m.value === values.month)) errors.month = 'Choose the month you would like to travel.';

  if (!Number.isInteger(travellers) || travellers < 1 || travellers > MAX_TRAVELLERS) {
    errors.travellers = `Between 1 and ${MAX_TRAVELLERS} travellers, please.`;
  }

  if (message.length > MESSAGE_LIMIT) errors.message = `Keep it under ${MESSAGE_LIMIT} characters.`;

  return errors;
}

/** Add or remove an interest id, ignoring unknown ids. */
export function toggleInterest(list, id) {
  if (!INTEREST_IDS.has(id)) return list;
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** The record stored under the `inquiries` key. */
export function createInquiry(values, brochure, now = new Date()) {
  return {
    id: `inq_${now.getTime().toString(36)}`,
    brochureId: brochure?.id ?? null,
    brochureSlug: brochure?.slug ?? null,
    brochureTitle: brochure?.title ?? '',
    organization: brochure?.organization ?? '',
    name: String(values.name).trim(),
    email: String(values.email).trim(),
    month: values.month,
    travellers: Number(values.travellers),
    interests: values.interests.filter((id) => INTEREST_IDS.has(id)),
    message: String(values.message ?? '').trim(),
    createdAt: now.toISOString(),
  };
}

/** Append to a stored list (which may be missing or corrupt), keeping the newest. */
export function appendInquiry(stored, record) {
  const list = Array.isArray(stored) ? stored.filter((x) => x && typeof x === 'object') : [];
  return [...list, record].slice(-MAX_SAVED_INQUIRIES);
}
