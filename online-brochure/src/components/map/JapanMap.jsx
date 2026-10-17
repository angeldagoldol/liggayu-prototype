import { useId, useMemo } from 'react';
import { cn } from '../../lib/cn.js';
import { REGIONS } from '../../data/regions.js';
import { graticule, height, insets, lakes, prefectures, project, regionCenters, width } from '../../data/geo/japan.js';
import { estimateTextWidth, fitView, layoutMarkers, mapSummary, pathBounds, pinFrame, placeLabels, projectPins, unionBounds } from './mapLayout.js';
import styles from './JapanMap.module.css';

const FULL = { x: 0, y: 0, width, height };
/** The four main islands and their neighbours (no inset), framed with a little sea: the key map's view. */
const MAIN = (() => {
  const box = unionBounds(prefectures.map((p) => pathBounds(p.d))) ?? FULL;
  const pad = Math.max(box.width, box.height) * 0.04;
  return { x: box.x - pad, y: box.y - pad, width: box.width + 2 * pad, height: box.height + 2 * pad };
})();
const PREFECTURES_BY_REGION = REGIONS.map((region) => ({ region, prefectures: prefectures.filter((p) => p.region === region.id) }));
const SEAS = [
  { id: 'nihonkai', label: 'Sea of Japan', labelJp: '日本海', lat: 38.6, lng: 134.2 },
  { id: 'taiheiyo', label: 'Pacific Ocean', labelJp: '太平洋', lat: 35.2, lng: 143.4 },
];

/**
 * An accurate map of Japan — the 47 prefectures from Natural Earth, drawn like a
 * printed atlas plate (hairline coast, paper land, faint graticule) with
 * Okinawa in an inset — plus numbered pins.
 *
 *   <JapanMap pins={[{ id, lat, lng, label, labelJp }]} highlightedRegion="kansai" />
 *
 * - `pins`              numbered 1…n in the order given (match your list); pins close
 *                       together fan out on a ring with leader lines. Labels that fit are drawn.
 * - `focus`             'pins' (default) zooms to the pins when they are close together;
 *                       'japan' always shows the whole country.
 * - `highlightedRegion` a region id from data/regions.js, tinted with the accent.
 * - `fillByRegion`      tint the eight regions in three alternating paper tones.
 * - `regionLabels`      print the region names (whole-country view only).
 * - `onRegionEnter(id | null)`, `onRegionClick(id)` make regions focusable buttons
 *                       (hover/focus enter, Enter/Space/click select).
 * - `aspect`            width / height of the slot (e.g. 1.3), so the view fills it; an inset
 *                       view keeps its box's shape. Default: the map's own shape.
 * - `labelScale`        multiplies marker and label size (1 = sized for a brochure page).
 * - `minSpan`           the closest zoom, as a share of the whole map's width (default 0.26,
 *                       about 400 km); a city guide can go to ~0.05 (about 80 km).
 * - `overview`          with a zoomed view, a small key map of the whole country in a free
 *                       corner, marking the area on show.
 * - `variant`           'atlas' (default) or 'locator': the whole country, quiet (no grid,
 *                       borders, labels or numbers), each pin a dot with a ring — a
 *                       "you are here" for one place.
 * - `label`             accessible name; defaults to a summary of the pins.
 * Colours come from CSS variables: the brochure theme (--b-*) on a brochure page,
 * the app tokens elsewhere; override --map-* on the root to restyle.
 */
export function JapanMap({
  pins,
  focus = 'pins',
  highlightedRegion,
  fillByRegion = false,
  regionLabels = false,
  seaLabels = true,
  showLabels = true,
  onRegionEnter,
  onRegionClick,
  labelScale = 1,
  minSpan,
  overview = false,
  variant = 'atlas',
  aspect,
  label,
  className,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const interactive = Boolean(onRegionClick || onRegionEnter);
  const locator = variant === 'locator';

  const projected = useMemo(() => projectPins(pins, project), [pins]);
  const visible = useMemo(() => projected.filter((p) => p.inFrame), [projected]);
  const { view, insetView, mainOnly } = useMemo(() => {
    // Pins in an inset and on the main islands live in two coordinate systems: show the whole map.
    const mixed = visible.some((p) => p.inset) && visible.some((p) => !p.inset);
    // A locator for places on the main islands frames just those islands (no inset box).
    if (locator && !visible.some((p) => p.inset)) return { view: MAIN, insetView: false, mainOnly: true };
    const whole = focus === 'japan' || mixed || locator;
    const frame = whole ? FULL : pinFrame(visible, FULL, insets);
    const inInset = frame.width < width;
    const span = Number.isFinite(minSpan) && minSpan > 0 ? { minSpan } : {};
    return { view: fitView(whole ? [] : visible, frame, { aspect: inInset ? undefined : aspect, ...span }), insetView: inInset };
  }, [focus, visible, aspect, locator, minSpan]);
  const zoomed = view.width < width && !mainOnly;
  // A close-up of the main islands never shows a sliver of the inset box (or its islands) in a corner.
  const showInsets = (!zoomed || insetView) && !mainOnly;
  const unit = view.width / 100;
  const radius = 1.45 * unit * labelScale;
  const fontSize = 2.35 * unit * labelScale;

  // Inset captions sit in the bottom-right corner of the part of the box on show.
  const insetCaptions = useMemo(() => {
    if (!showInsets || locator) return [];
    const size = zoomed ? fontSize : 44 * labelScale;
    const pad = zoomed ? fontSize * 0.7 : 24;
    return insets.map((inset) => {
      const x = Math.min(inset.box.x + inset.box.width, view.x + view.width) - pad;
      const y = Math.min(inset.box.y + inset.box.height, view.y + view.height) - pad;
      const w = estimateTextWidth(`${inset.labelJp}  ${inset.label}`, size);
      return { id: inset.id, inset, x, y, size, box: { x: x - w, y: y - size * 1.05, width: w, height: size * 1.3 } };
    });
  }, [showInsets, zoomed, fontSize, labelScale, view, locator]);

  const markers = useMemo(() => (locator ? visible.map((p) => ({ ...p, mx: p.x, my: p.y, displaced: false })) : layoutMarkers(visible, { radius })), [visible, radius, locator]);
  // The key map takes the first corner of a zoomed main-islands view that no marker touches.
  const keyMap = useMemo(() => (overview && zoomed && !insetView && !locator ? overviewBox(view, markers, radius) : null), [overview, zoomed, insetView, locator, view, markers, radius]);
  const labels = useMemo(() => {
    if (!showLabels || locator) return [];
    const texts = markers.map((m) => [m.label, m.labelJp].filter((t) => typeof t === 'string' && t.trim()).join('  '));
    const inset = { x: view.x + unit, y: view.y + unit, width: view.width - 2 * unit, height: view.height - 2 * unit };
    const obstacles = [...insetCaptions.map((c) => c.box), ...(keyMap ? [keyMap] : [])];
    return placeLabels(markers, { radius, fontSize, bounds: inset, texts, obstacles });
  }, [markers, showLabels, locator, radius, fontSize, view, unit, insetCaptions, keyMap]);

  const summary = label || mapSummary(pins, REGIONS.find((r) => r.id === highlightedRegion)?.label);
  const regionProps = (region) => {
    if (!interactive) return {};
    const enter = () => onRegionEnter?.(region.id);
    const leave = () => onRegionEnter?.(null);
    return {
      role: 'button',
      tabIndex: 0,
      'aria-label': `${region.label} ${region.jp}`,
      onPointerEnter: enter,
      onPointerLeave: leave,
      onFocus: enter,
      onBlur: leave,
      onClick: () => onRegionClick?.(region.id),
      onKeyDown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onRegionClick?.(region.id);
        }
      },
    };
  };

  return (
    <div
      className={cn(styles.map, interactive && styles.interactive, locator && styles.locator, className)}
      style={{ '--map-aspect': `${view.width} / ${view.height}` }}
      data-zoomed={zoomed || undefined}
    >
      <svg
        className={styles.svg}
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
        preserveAspectRatio="xMidYMid meet"
        role={interactive ? 'group' : 'img'}
        aria-label={summary}
        focusable="false"
      >
        <defs>
          <clipPath id={`${uid}-view`}>
            <rect x={view.x} y={view.y} width={view.width} height={view.height} />
          </clipPath>
          {insets.map((inset) => (
            <clipPath key={inset.id} id={`${uid}-${inset.id}`}>
              <rect x={inset.box.x} y={inset.box.y} width={inset.box.width} height={inset.box.height} />
            </clipPath>
          ))}
        </defs>

        <g clipPath={`url(#${uid}-view)`}>
          <rect className={styles.sea} x={view.x} y={view.y} width={view.width} height={view.height} />
          {!locator && <path className={styles.graticule} d={graticule.main} />}

          {(showInsets ? insets : []).map((inset) => (
            <g key={inset.id} className={styles.insetFrame}>
              <rect x={inset.box.x} y={inset.box.y} width={inset.box.width} height={inset.box.height} />
              {graticule[inset.id] && !locator && <path className={styles.graticule} d={graticule[inset.id]} clipPath={`url(#${uid}-${inset.id})`} />}
            </g>
          ))}

          {/* Coast: every outline drawn with a heavier stroke under the fills, so only the shore keeps it. */}
          <g className={styles.coast} aria-hidden="true">
            {prefectures.map((p) => (
              <g key={p.code}>
                {p.d && <path d={p.d} />}
                {showInsets && p.insetD && <path d={p.insetD} />}
              </g>
            ))}
          </g>

          {PREFECTURES_BY_REGION.map(({ region, prefectures: list }) => (
            <g
              key={region.id}
              className={styles.region}
              data-region={region.id}
              data-fill={fillByRegion ? REGION_TONE[region.id] : undefined}
              data-highlighted={highlightedRegion === region.id || undefined}
              {...regionProps(region)}
            >
              {list.map((p) => (
                <g key={p.code} data-code={p.code}>
                  {p.d && <path d={p.d} />}
                  {showInsets && p.insetD && <path d={p.insetD} />}
                </g>
              ))}
            </g>
          ))}

          <g className={styles.lakes} aria-hidden="true">
            {lakes.map((lake) => (
              <path key={lake.name} d={lake.d} />
            ))}
          </g>

          <g aria-hidden="true">
            {insetCaptions.map(({ id, inset, x, y, size }) => (
              <text key={id} className={styles.insetLabel} x={x} y={y} textAnchor="end" style={{ fontSize: size }}>
                <tspan className={styles.jp} lang="ja">
                  {inset.labelJp}
                </tspan>
                <tspan dx="0.45em">{inset.label}</tspan>
              </text>
            ))}

            {!zoomed && seaLabels && !locator && SEAS.map((sea) => <SeaLabel key={sea.id} sea={sea} size={42 * labelScale} />)}

            {!zoomed &&
              regionLabels &&
              !locator &&
              REGIONS.map((region) => {
                const at = regionCenters[region.id];
                if (!at) return null;
                return (
                  <text key={region.id} className={styles.regionLabel} x={at[0]} y={at[1]} textAnchor="middle" style={{ fontSize: 40 * labelScale }}>
                    {region.label.split(' & ')[0]}
                  </text>
                );
              })}
          </g>

          {keyMap && <KeyMap box={keyMap} view={view} highlightedRegion={highlightedRegion} />}

          {markers.length > 0 && locator && (
            <g className={styles.pins} aria-hidden="true">
              {markers.map((m) => (
                <g key={m.id}>
                  <circle className={styles.ring} cx={m.mx} cy={m.my} r={radius * 2.4} />
                  <circle className={styles.marker} cx={m.mx} cy={m.my} r={radius} />
                </g>
              ))}
            </g>
          )}

          {markers.length > 0 && !locator && (
            <g className={styles.pins} aria-hidden="true" style={{ '--r': radius }}>
              {markers.map((m) => (m.displaced ? <line key={`l-${m.id}`} className={styles.leader} x1={m.x} y1={m.y} x2={m.mx} y2={m.my} /> : null))}
              {markers.map((m) => (m.displaced ? <circle key={`d-${m.id}`} className={styles.spot} cx={m.x} cy={m.y} r={radius * 0.28} /> : null))}
              {markers.map((m, i) => {
                const text = labels[i];
                return (
                  <g key={m.id} className={styles.pin}>
                    <circle className={styles.marker} cx={m.mx} cy={m.my} r={radius} />
                    <text className={styles.number} x={m.mx} y={m.my} dy="0.35em" textAnchor="middle" style={{ fontSize: radius * (m.number > 9 ? 1 : 1.25) }}>
                      {m.number}
                    </text>
                    {text && (
                      <text className={styles.label} x={text.tx} y={text.ty} textAnchor={text.anchor} style={{ fontSize, strokeWidth: fontSize * 0.28 }}>
                        {m.label}
                        {m.labelJp && (
                          <tspan className={styles.labelJp} lang="ja" dx="0.4em">
                            {m.labelJp}
                          </tspan>
                        )}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}
        </g>
        {/* A zoomed view is a plate cut from the map: frame it with a hairline. */}
        {zoomed && <rect className={styles.plate} x={view.x + unit * 0.12} y={view.y + unit * 0.12} width={view.width - unit * 0.24} height={view.height - unit * 0.24} />}
      </svg>
    </div>
  );
}

/**
 * Where the key map goes in a zoomed view: a box 27% of the view wide, in the
 * first corner (bottom-right, top-left, top-right, bottom-left) that no marker
 * touches; null when every corner is taken.
 */
function overviewBox(view, markers, radius) {
  const w = view.width * 0.27;
  const h = (w * MAIN.height) / MAIN.width;
  const pad = view.width * 0.025;
  const corners = [
    { x: view.x + view.width - pad - w, y: view.y + view.height - pad - h },
    { x: view.x + pad, y: view.y + pad },
    { x: view.x + view.width - pad - w, y: view.y + pad },
    { x: view.x + pad, y: view.y + view.height - pad - h },
  ];
  const clear = (box) => markers.every((m) => m.mx + radius * 1.6 < box.x || m.mx - radius * 1.6 > box.x + w || m.my + radius * 1.6 < box.y || m.my - radius * 1.6 > box.y + h);
  const found = corners.find((c) => clear(c));
  return found ? { ...found, width: w, height: h } : null;
}

/** A small whole-country map (main islands) marking the area a zoomed view shows. */
function KeyMap({ box, view, highlightedRegion }) {
  const size = Math.max(view.width, 150);
  const cx = view.x + view.width / 2;
  const cy = view.y + view.height / 2;
  return (
    <svg className={styles.keyMap} x={box.x} y={box.y} width={box.width} height={box.height} viewBox={`${MAIN.x} ${MAIN.y} ${MAIN.width} ${MAIN.height}`} aria-hidden="true">
      <rect className={styles.keyPaper} x={MAIN.x} y={MAIN.y} width={MAIN.width} height={MAIN.height} />
      {prefectures.map((p) => (p.d ? <path key={p.code} d={p.d} data-highlighted={p.region === highlightedRegion || undefined} /> : null))}
      <rect className={styles.keyView} x={cx - size / 2} y={cy - (size * view.height) / view.width / 2} width={size} height={(size * view.height) / view.width} />
    </svg>
  );
}

/** Three tones, so neighbouring regions never share one. */
const REGION_TONE = { hokkaido: 'b', tohoku: 'a', kanto: 'b', chubu: 'c', kansai: 'a', chugoku: 'b', shikoku: 'c', kyushu: 'a' };

function SeaLabel({ sea, size }) {
  const p = project(sea.lat, sea.lng);
  if (!p) return null;
  return (
    <text className={styles.seaLabel} x={p.x} y={p.y} textAnchor="middle" style={{ fontSize: size }}>
      <tspan className={styles.jp} lang="ja" x={p.x}>
        {sea.labelJp}
      </tspan>
      <tspan className={styles.seaEn} x={p.x} dy="1.3em">
        {sea.label}
      </tspan>
    </text>
  );
}
