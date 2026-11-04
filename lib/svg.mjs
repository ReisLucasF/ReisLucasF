import { pix, textWidth } from './font.mjs';

// Tokens do site (src/app/globals.css)
export const T = {
  bg: '#09090b', bg1: '#0e0e11', bg2: '#15151a',
  line: '#1c1c22', line2: '#2a2a31',
  fg: '#ededee', fg2: '#a1a1aa', fg3: '#67676f',
  accent: '#ff5b1f', accentDim: '#7a2f12', live: '#3ddc84',
  amber: '#f5a524', red: '#e5484d', violet: '#a78bfa', blue: '#60a5fa',
};
export const MONO = `ui-monospace,SFMono-Regular,'Geist Mono','JetBrains Mono',Menlo,Consolas,'Liberation Mono',monospace`;

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const r2 = n => +(+n).toFixed(2);

/** Whole SVG document. Animations are plain CSS: GitHub renders them inside <img>. */
export function doc(w, h, title, body, css = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}" shape-rendering="crispEdges">
<title>${esc(title)}</title>
<style>
text{font-family:${MONO}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
${css}
</style>
<defs>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" opacity=".018"/></pattern>
<pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="1" height="1" fill="#fff" opacity=".06"/></pattern>
</defs>
${body}
</svg>
`;
}

/** Rect with stepped ("pixel") corners. */
export function pixRect(x, y, w, h, c = 4) {
  return `M${x + c} ${y}h${w - 2 * c}v${c}h${c}v${h - 2 * c}h${-c}v${c}h${-(w - 2 * c)}v${-c}h${-c}v${-(h - 2 * c)}h${c}z`;
}

/** Card frame: stepped border, title bar with pixel title and a meta tag on the right. */
export function frame(w, h, { title = '', meta = '', icon = '' } = {}) {
  const head = title ? `
  ${icon}
  ${pix(title, icon ? 46 : 22, 17, { s: 2, fill: T.accent })}
  ${meta ? `<text x="${w - 22}" y="29" text-anchor="end" font-size="12" fill="${T.fg3}" letter-spacing=".08em">${esc(meta)}</text>` : ''}
  <path fill="${T.line2}" d="${dashed(16, 44, w - 32)}"/>` : '';
  return `
  <path d="${pixRect(2, 2, w - 4, h - 4, 6)}" fill="${T.bg1}"/>
  <path d="${pixRect(2, 2, w - 4, h - 4, 6)}" fill="url(#dots)"/>
  <path d="${pixRect(2, 2, w - 4, h - 4, 6)}" fill="none" stroke="${T.line2}" stroke-width="2"/>
  ${head}`;
}
export const scanlines = (w, h) => `<rect width="${w}" height="${h}" fill="url(#scan)" pointer-events="none"/>`;

/** Dashed pixel line (path data). */
export function dashed(x, y, w, dash = 4, gap = 4, t = 2) {
  let d = '';
  for (let i = 0; i < w; i += dash + gap) d += `M${x + i} ${y}h${Math.min(dash, w - i)}v${t}h${-Math.min(dash, w - i)}z`;
  return d;
}

/** Monospace text. */
export function txt(s, x, y, { size = 13, fill = T.fg2, anchor = 'start', weight = 400, cls = '', ls = 0, style = '' } = {}) {
  return `<text x="${r2(x)}" y="${r2(y)}" font-size="${size}" fill="${fill}"${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''}${weight !== 400 ? ` font-weight="${weight}"` : ''}${ls ? ` letter-spacing="${ls}"` : ''}${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''}>${esc(s)}</text>`;
}

/**
 * Sprite from rows of characters; `map` gives a color per character ('.' and ' ' are empty).
 * One <path> per color, horizontal runs merged.
 */
export function sprite(rows, map, x, y, s = 4, attrs = '') {
  const byColor = {};
  rows.forEach((row, r) => {
    let c = 0;
    while (c < row.length) {
      const ch = row[c];
      if (!map[ch]) { c++; continue; }
      let e = c;
      while (e + 1 < row.length && row[e + 1] === ch) e++;
      (byColor[map[ch]] ||= []).push(`M${r2(x + c * s)} ${r2(y + r * s)}h${(e - c + 1) * s}v${s}h${-(e - c + 1) * s}z`);
      c = e + 1;
    }
  });
  return `<g${attrs}>${Object.entries(byColor).map(([col, d]) => `<path fill="${col}" d="${d.join('')}"/>`).join('')}</g>`;
}

/** Indexed bitmap ({ w, h, palette, rows }) as pixel paths; -1 / '.' = transparent. */
export function bitmap(art, x, y, s = 4, attrs = '') {
  const map = {};
  art.palette.forEach((c, i) => { map[art.chars[i]] = c; });
  return sprite(art.rows, map, x, y, s, attrs);
}

/** Segmented pixel bar. `frac` 0..1. */
export function bar(x, y, w, h, frac, { color = T.accent, seg = 0, cls = '', bg = T.bg2 } = {}) {
  const n = seg || Math.max(1, Math.round(w / (h + 2)));
  const sw = (w - (n - 1) * 2) / n;
  const on = Math.round(frac * n);
  let dOn = '', dOff = '';
  for (let i = 0; i < n; i++) {
    const px = r2(x + i * (sw + 2));
    const piece = `M${px} ${y}h${r2(sw)}v${h}h${-r2(sw)}z`;
    if (i < on) dOn += piece; else dOff += piece;
  }
  return `<path fill="${bg}" d="${dOff}"/><path fill="${color}"${cls ? ` class="${cls}"` : ''} d="${dOn}"/>`;
}

/** CSS keyframes with stepped visibility: element visible in [a, b) of the cycle (0..1). */
export function windowKf(name, a, b, prop = 'opacity', on = 1, off = 0) {
  const p = v => r2(v * 100) + '%';
  if (a <= 0 && b >= 1) return `@keyframes ${name}{0%,100%{${prop}:${on}}}`;
  const parts = [];
  if (a > 0) parts.push(`0%,${p(a - 0.0001)}{${prop}:${off}}`);
  parts.push(`${p(a)},${p(Math.min(b, 1) - 0.0001)}{${prop}:${on}}`);
  if (b < 1) parts.push(`${p(b)},100%{${prop}:${off}}`);
  return `@keyframes ${name}{${parts.join('')}}`;
}

export { pix, textWidth };
