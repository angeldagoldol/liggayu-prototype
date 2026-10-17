/**
 * Brochure categories. `jp` is the short Japanese label shown in vertical
 * type; `color` is a wa-iro token used for chips, dots and badges.
 */
export const CATEGORIES = [
  { id: 'cities', label: 'Cities & Nightlife', jp: '都市', icon: 'Building2', color: 'var(--wa-ai)' },
  { id: 'heritage', label: 'Temples & Heritage', jp: '寺社', icon: 'Landmark', color: 'var(--wa-shu)' },
  { id: 'nature', label: 'Mountains & Nature', jp: '自然', icon: 'MountainSnow', color: 'var(--wa-matcha)' },
  { id: 'islands', label: 'Islands & Coast', jp: '島', icon: 'Waves', color: 'var(--wa-sora)' },
  { id: 'food', label: 'Food & Drink', jp: '食', icon: 'Soup', color: 'var(--wa-yamabuki)' },
  { id: 'onsen', label: 'Onsen & Ryokan', jp: '温泉', icon: 'Bath', color: 'var(--wa-fuji)' },
  { id: 'festivals', label: 'Festivals & Seasons', jp: '祭', icon: 'Flower2', color: 'var(--wa-sakura)' },
  { id: 'craft', label: 'Arts & Craft', jp: '工芸', icon: 'Brush', color: 'var(--wa-kin)' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id) {
  return CATEGORY_MAP[id] ?? { id, label: id, jp: '旅', icon: 'Sparkles', color: 'var(--accent)' };
}
