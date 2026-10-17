// PLACEHOLDER — replaced by the brochure-kit build step. Keep this API:
// <CoverArt style="seigaiha" seed={7} theme={brochure.theme} className animated title />
export function CoverArt({ style = 'hinomaru', seed = 1, theme, className, title }) {
  const paper = theme?.paper ?? '#f4eee2';
  const accent = theme?.accent ?? '#d23a22';
  const accent2 = theme?.accent2 ?? '#1d4f7a';
  return (
    <svg
      viewBox="0 0 300 400"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      data-art={style}
      data-seed={seed}
    >
      <rect width="300" height="400" fill={paper} />
      <circle cx="150" cy="170" r="80" fill={accent} />
      <path d="M0 330 L150 230 L300 330 V400 H0Z" fill={accent2} />
    </svg>
  );
}
