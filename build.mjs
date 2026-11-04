// LR-OS: gera os SVGs do README de perfil. Uso: node build.mjs
// Tudo é CSS dentro do SVG (o GitHub anima <img> SVG, mas não roda JS nem carrega fontes).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cfg from './profile.config.mjs';
import { T, doc, frame, scanlines, pixRect, dashed, txt, sprite, bitmap, bar, windowKf, pix, textWidth, r2, esc } from './lib/svg.mjs';
import * as S from './lib/sprites.mjs';
import { githubStats } from './lib/github.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(root, 'assets');
fs.mkdirSync(OUT, { recursive: true });
const art = JSON.parse(fs.readFileSync(path.join(root, 'data', 'art.json'), 'utf8'));

const W = 840;
const pct = v => r2(v * 100) + '%';
const pad = (n, k) => String(n).padStart(k, '0');
const fmtN = n => Number(n).toLocaleString('pt-BR');
function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }

// nível = anos desde o início da carreira; XP = fração do ano corrente nesse nível
const now = new Date();
const start = new Date(cfg.careerStart + 'T00:00:00');
const years = (now - start) / (365.2425 * 864e5);
const LEVEL = Math.max(1, Math.floor(years));
const XP = years - Math.floor(years);
const nextLevelAt = new Date(start); nextLevelAt.setFullYear(start.getFullYear() + LEVEL + 1);
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const files = {};
const save = (name, svg) => { fs.writeFileSync(path.join(OUT, name), svg); files[name] = svg.length; };

/* ======================================================================
   1. Banner: boot do LR-OS, depois a cena
   ====================================================================== */
function banner() {
  const H = 300, rnd = rng(42);
  let css = `
.blink{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}
.boot{opacity:0;animation:bootOff .35s 3s both}@keyframes bootOff{from{opacity:1}to{opacity:0}}
.bl{animation:on .01s both}@keyframes on{from{opacity:0}to{opacity:1}}
.glitch{animation:glitch 6s steps(1) infinite}
@keyframes glitch{0%,91%,100%{transform:translate(0,0)}92%{transform:translate(-4px,0)}93%{transform:translate(3px,-2px)}94%{transform:translate(0,0)}96%{transform:translate(2px,1px)}97%{transform:translate(0,0)}}
.code{animation:code 2.4s steps(6) infinite}@keyframes code{to{transform:translateY(-36px)}}
.steam{animation:steam 2.4s linear infinite;opacity:0}@keyframes steam{0%{transform:translateY(0);opacity:0}20%{opacity:.8}100%{transform:translateY(-22px);opacity:0}}
.eyes{transform-box:fill-box;transform-origin:center;animation:eyes 5s steps(1) infinite}@keyframes eyes{0%,92%,100%{transform:scaleY(1)}93%,96%{transform:scaleY(.2)}}
.tail{transform-box:fill-box;transform-origin:0 100%;animation:tail 1.6s steps(2) infinite alternate}@keyframes tail{from{transform:rotate(-14deg)}to{transform:rotate(12deg)}}
.tw{animation:tw 3s steps(2) infinite}@keyframes tw{50%{opacity:.15}}
.bubble{opacity:0;animation:bubble 9s steps(1) infinite}@keyframes bubble{0%,55%{opacity:0}56%,86%{opacity:1}87%,100%{opacity:0}}
`;
  let b = frame(W, H);
  // estrelas
  for (let i = 0; i < 16; i++) {
    const x = Math.round(470 + rnd() * 350), y = Math.round(54 + rnd() * 90), s = rnd() < 0.3 ? 3 : 2;
    b += `<rect class="tw" style="animation-delay:-${r2(rnd() * 3)}s" x="${x}" y="${y}" width="${s}" height="${s}" fill="${rnd() < 0.25 ? T.accent : T.fg2}"/>`;
  }
  // HUD
  b += pix('1UP', 24, 18, { s: 2, fill: T.accent }) + pix(cfg.name, 72, 18, { s: 2, fill: T.fg });
  b += pix(`WORLD ${cfg.world || 'BR'}`, 430, 18, { s: 2, fill: T.fg3, align: 'middle' });
  b += pix(`LVL ${pad(LEVEL, 2)}`, 712, 18, { s: 2, fill: T.accent, align: 'end' });
  for (let i = 0; i < 5; i++) b += sprite(S.HEART.rows, S.HEART.map, 724 + i * 19, 18, 3);
  // nome com sombra 3D em laranja
  const name = cfg.name.split(' ');
  const nm = (dx, dy, fill, cls = '') => `<g${cls ? ` class="${cls}"` : ''}>${pix(name[0], 28 + dx, 62 + dy, { s: 8, fill })}${pix(name.slice(1).join(' '), 28 + dx, 130 + dy, { s: 8, fill })}</g>`;
  b += nm(6, 6, T.accentDim) + nm(3, 3, T.accent) + nm(0, 0, T.fg, 'glitch');
  b += pix(cfg.role, 28, 204, { s: 3, fill: T.accent });
  b += txt('Founder & CTO · Devos  /  Analista · Domo × Mercantil', 28, 252, { size: 13, fill: T.fg2 });
  b += `<g class="blink">${pix('▶ PRESS START', 28, 268, { s: 2, fill: T.fg })}</g>`;

  // cena: você no notebook, café e o Salomão
  b += `<rect x="470" y="250" width="352" height="8" fill="#6b4423"/><rect x="470" y="250" width="352" height="2" fill="#8a5a30"/><rect x="470" y="258" width="352" height="30" fill="#3a2513" opacity=".55"/>`;
  b += sprite(S.dev(0).rows, S.dev(0).map, 587, 104, 4);
  b += sprite(S.LAPTOP.rows, S.LAPTOP.map, 560, 180, 5);
  // código rolando na tela
  const cr = rng(9), lines = [];
  for (let i = 0; i < 6; i++) {
    let x = 0, row = '';
    const indent = [0, 6, 12, 6, 0, 12][i];
    x = indent;
    while (x < 78) {
      const w = Math.round(6 + cr() * 22);
      if (x + w > 84) break;
      row += `<rect x="${570 + x}" y="${188 + i * 6}" width="${w}" height="3" fill="${[T.accent, T.fg2, T.live, T.violet, T.fg3][Math.floor(cr() * 5)]}"/>`;
      x += w + 4;
    }
    lines.push(row);
  }
  b += `<clipPath id="scr"><rect x="570" y="185" width="90" height="40"/></clipPath><g clip-path="url(#scr)"><rect x="570" y="185" width="90" height="40" fill="#0b0f14"/><g class="code">${lines.join('')}<g transform="translate(0 36)">${lines.join('')}</g></g></g>`;
  b += `<rect x="610" y="236" width="10" height="3" fill="${T.accent}" opacity=".9"/>`; // logo
  b += sprite(S.MUG.rows, S.MUG.map, 686, 222, 4);
  [694, 702, 710].forEach((x, i) => { b += `<rect class="steam" style="animation-delay:${i * 0.8}s" x="${x}" y="212" width="3" height="5" fill="${T.fg2}"/>`; });
  b += sprite(S.CAT_BODY.rows, S.CAT_BODY.map, 742, 190, 5);
  b += sprite(S.CAT_EYES.rows, S.CAT_EYES.map, 742, 190, 5, ' class="eyes"');
  b += sprite(S.CAT_TAIL.rows, S.CAT_TAIL.map, 792, 230, 5, ' class="tail"');
  b += `<g class="bubble"><path d="${pixRect(714, 152, 96, 26, 4)}" fill="${T.fg}"/><rect x="772" y="178" width="6" height="4" fill="${T.fg}"/><rect x="776" y="182" width="4" height="4" fill="${T.fg}"/>${pix('LGTM ✓', 762, 162, { s: 2, fill: T.bg, align: 'middle' })}</g>`;

  // boot (roda uma vez, por cima de tudo)
  const boot = [
    ['LR-OS BIOS v4.0 · (C) 2022-' + now.getFullYear() + ' ' + cfg.name.toUpperCase(), ''],
    ['MEM CHECK ................. 640K', 'OK'],
    ['CAFE.EXE .................. carregado', 'OK'],
    ['SALOMAO.SYS ............... revisor de PRs', 'ONLINE'],
    ['MONTANDO /dev/hospital .... multitenant', '24/7'],
    ['MONTANDO /dev/banco ....... cards & popups', 'OK'],
    ['INICIANDO LUCAS REIS ', ''],
  ];
  let bootG = `<path d="${pixRect(2, 2, W - 4, H - 4, 6)}" fill="${T.bg}"/>`;
  boot.forEach(([l, st], i) => {
    const y = 46 + i * 26;
    bootG += `<g class="bl" style="animation-delay:${r2(0.15 + i * 0.36)}s">${txt(l, 32, y, { size: 13, fill: i === 0 ? T.fg : T.fg3 })}${st ? txt(st, 520, y, { size: 13, fill: T.live, anchor: 'end', weight: 700 }) : ''}</g>`;
  });
  bootG += `<rect class="bl blink" style="animation-delay:${r2(0.15 + 6 * 0.36)}s" x="${32 + 21 * 7.8}" y="${46 + 6 * 26 - 12}" width="9" height="15" fill="${T.accent}"/>`;
  b += `<g class="boot">${bootG}</g>`;
  b += scanlines(W, H);
  save('banner.svg', doc(W, H, `${cfg.name}, ${cfg.role}`, b, css));
}

/* ======================================================================
   2. Terminal digitando
   ====================================================================== */
function typing() {
  const H = 52, cw = 9, P = 6.5, C = P * cfg.typing.length;
  const prompt = 'lucas@lr-os:~$';
  const x0 = 22 + prompt.length * cw + 12;
  const maxN = Math.max(...cfg.typing.map(s => [...s].length));
  let css = `.cur{animation:blink .9s steps(1) infinite}@keyframes blink{50%{opacity:0}}`;
  let b = `<path d="${pixRect(2, 2, W - 4, H - 4, 6)}" fill="${T.bg1}"/><path d="${pixRect(2, 2, W - 4, H - 4, 6)}" fill="none" stroke="${T.line2}" stroke-width="2"/>`;
  b += `<text x="22" y="32" font-size="15" fill="${T.live}" textLength="${prompt.length * cw}" lengthAdjust="spacingAndGlyphs">${prompt}</text>`;
  cfg.typing.forEach((s, i) => {
    const n = [...s].length, w = n * cw, a = i * P;
    css += windowKf(`v${i}`, a / C, (a + P) / C);
    css += `@keyframes m${i}{0%{transform:translateX(0)}${pct(a / C)}{transform:translateX(0);animation-timing-function:steps(${n},end)}${pct((a + 2.3) / C)}{transform:translateX(${w}px)}${pct((a + 5.5) / C)}{transform:translateX(${w}px);animation-timing-function:steps(${n},end)}${pct((a + 6.1) / C)}{transform:translateX(0)}100%{transform:translateX(0)}}`;
    // estado estático (sem animação): primeira frase inteira
    css += `.p${i}{opacity:${i ? 0 : 1};animation:v${i} ${C}s infinite}.mv${i}{transform:translateX(${i ? 0 : w}px);animation:m${i} ${C}s infinite}`;
    b += `<g class="p${i}"><text x="${x0}" y="32" font-size="15" fill="${T.fg}" textLength="${w}" lengthAdjust="spacingAndGlyphs">${esc(s)}</text>
<g class="mv${i}"><rect x="${x0}" y="10" width="${maxN * cw + 30}" height="32" fill="${T.bg1}"/><rect class="cur" x="${x0 + 2}" y="17" width="9" height="19" fill="${T.accent}"/></g></g>`;
  });
  save('typing.svg', doc(W, H, cfg.typing.join(' · '), b, css));
}

/* ======================================================================
   3. Ficha do personagem
   ====================================================================== */
function sheet() {
  const H = 410;
  const css = `
.grow{transform-box:fill-box;transform-origin:0 50%;animation:grow 1.4s steps(12) both}@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.sweep{animation:sweep 4s linear infinite}@keyframes sweep{from{transform:translateY(0)}to{transform:translateY(200px)}}
.blink{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}`;
  let b = frame(W, H, { title: 'FICHA DO PERSONAGEM', meta: `SAVE 01 · ${pad(now.getDate(), 2)}/${pad(now.getMonth() + 1, 2)}/${now.getFullYear()}` });
  // retrato (a sua arte, pixelada)
  b += `<path d="${pixRect(24, 58, 216, 216, 6)}" fill="${T.bg2}"/><path d="${pixRect(24, 58, 216, 216, 6)}" fill="none" stroke="${T.accent}" stroke-width="3"/>`;
  b += `<clipPath id="pc"><rect x="32" y="66" width="200" height="200"/></clipPath><g clip-path="url(#pc)">${bitmap(art.portrait, 32, 66, 4)}<rect class="sweep" x="32" y="66" width="200" height="6" fill="#fff" opacity=".06"/></g>`;
  b += pix('LVL', 32, 290, { s: 3, fill: T.fg3 }) + pix(pad(LEVEL, 2), 32 + textWidth('LVL ', 3), 290, { s: 3, fill: T.accent });
  b += txt('XP', 32, 332, { size: 11, fill: T.fg3, ls: '.1em' }) + txt(`${Math.round(XP * 100)}%`, 232, 332, { size: 11, fill: T.fg2, anchor: 'end' });
  b += `<g class="grow">${bar(32, 340, 200, 10, XP, { seg: 20 })}</g>`;
  b += txt(`LVL ${pad(LEVEL + 1, 2)} em ${MES[nextLevelAt.getMonth()]}/${nextLevelAt.getFullYear()}`, 32, 372, { size: 11, fill: T.fg3 });

  const X = 268;
  b += pix(cfg.name, X, 64, { s: 4, fill: T.fg });
  b += txt(`${cfg.role} · Founder & CTO`, X, 118, { size: 14, fill: T.accent });
  cfg.sheet.forEach(([k, v], i) => {
    const y = 152 + i * 26;
    b += txt(k, X, y, { size: 11, fill: T.fg3, ls: '.1em' }) + txt(v, X + 112, y, { size: 13.5, fill: T.fg });
  });
  b += `<path fill="${T.line2}" d="${dashed(X, 274, W - X - 24)}"/>`;
  // HP / MP
  const st = [['HP', 'UPTIME 24/7', 1, T.live], ['MP', 'CAFÉ 99,9%', 0.999, T.amber]];
  st.forEach(([k, label, f, color], i) => {
    const x = X + i * 282;
    b += pix(k, x, 290, { s: 2, fill: color }) + txt(label, x + 32, 302, { size: 11.5, fill: T.fg2 });
    b += `<g class="grow" style="animation-delay:${0.2 + i * 0.2}s">${bar(x, 312, 260, 10, f, { seg: 26, color })}</g>`;
  });
  cfg.attributes.forEach(([k, v], i) => {
    const x = X + (i % 2) * 282, y = 346 + Math.floor(i / 2) * 22;
    b += txt(k, x, y + 8, { size: 11, fill: T.fg2, ls: '.06em' }) + `<g class="grow" style="animation-delay:${0.5 + i * 0.12}s">${bar(x + 118, y, 142, 9, v / 10, { seg: 10, color: T.accent })}</g>`;
  });
  b += scanlines(W, H);
  save('ficha.svg', doc(W, H, `Ficha do personagem: ${cfg.name}, nível ${LEVEL}`, b, css));
}

/* ======================================================================
   4. Mapa da jornada
   ====================================================================== */
function journey() {
  const H = 262, Y = 170, n = cfg.journey.length, gap = (W - 120) / (n - 1);
  const xs = cfg.journey.map((_, i) => 60 + i * gap);
  const last = cfg.journey.map(j => j.status).lastIndexOf('now') >= 0 ? Math.max(...cfg.journey.map((j, i) => (j.status === 'locked' ? -1 : i))) : 0;
  const stay = 0.8, travel = 1.0, step = stay + travel, hold = 2.6;
  const C = last * step + stay + hold + 0.5;
  let css = `
.pulse{animation:pulse 1.2s steps(2) infinite}@keyframes pulse{50%{opacity:.35}}
.f0{animation:fa .4s steps(1) infinite}.f1{animation:fb .4s steps(1) infinite}@keyframes fa{50%{opacity:0}}@keyframes fb{0%{opacity:0}50%{opacity:1}}
.boss{animation:boss 1.6s steps(1) infinite}@keyframes boss{50%{fill:${T.red}}}`;
  // caminhante: anda de nó em nó, para em cada um
  let kf = '';
  for (let i = 0; i <= last; i++) {
    const a = i * step, x = xs[i] - 18;
    kf += `${pct(a / C)}{transform:translateX(${r2(x)}px);opacity:1}${pct((a + stay) / C)}{transform:translateX(${r2(x)}px);opacity:1}`;
  }
  const end = last * step + stay + hold;
  kf += `${pct(end / C)}{transform:translateX(${r2(xs[last] - 21)}px);opacity:1}${pct((end + 0.3) / C)}{transform:translateX(${r2(xs[last] - 21)}px);opacity:0}100%{transform:translateX(${r2(xs[0] - 21)}px);opacity:0}`;
  css += `@keyframes walk{${kf}}.walker{transform:translateX(${r2(xs[last] - 21)}px);animation:walk ${r2(C)}s infinite}`;
  let b = frame(W, H, { title: 'MAPA DA JORNADA', meta: `WORLD 2-3 · EM ANDAMENTO` });
  b += `<path fill="${T.fg3}" d="${dashed(60, Y - 2, W - 120, 6, 6, 4)}"/>`;
  cfg.journey.forEach((j, i) => {
    const x = xs[i], up = i % 2 === 0;
    const col = j.status === 'done' ? T.live : j.status === 'now' ? T.accent : T.fg3;
    b += `<path d="${pixRect(x - 13, Y - 13, 26, 26, 3)}" fill="${j.status === 'locked' ? T.bg2 : col}"${j.status === 'now' ? ' class="pulse"' : ''}/>`;
    if (j.status === 'done') b += pix('✓', x, Y - 7, { s: 2, fill: T.bg, align: 'middle' });
    if (j.status === 'now') b += pix('▶', x + 1, Y - 7, { s: 2, fill: T.bg, align: 'middle' });
    if (j.status === 'locked') b += `<path class="boss" fill="${T.fg3}" d="${(pix('?', x, Y - 7, { s: 2 }).match(/d="([^"]+)"/) || [])[1]}"/>`;
    const lab = j.year && !/^\?+$/.test(j.year) ? `${j.stage} · ${j.year}` : j.stage;
    // rótulos das pontas não podem sair do card
    const half = Math.max(textWidth(lab, 2), Math.max(j.title.length, j.sub.length) * 7) / 2;
    const lx = Math.min(W - 22 - half, Math.max(22 + half, x));
    const [ly, ty, sy] = up ? [60, 94, 110] : [196, 228, 244];
    b += pix(lab, lx, ly, { s: 2, fill: col, align: 'middle' });
    b += txt(j.title, lx, ty, { size: 12.5, fill: T.fg, anchor: 'middle', weight: 700 }) + txt(j.sub, lx, sy, { size: 11, fill: T.fg2, anchor: 'middle' });
    // "+XP" sobe quando o caminhante chega
    if (i <= last) {
      const a = i * step;
      css += `@keyframes xp${i}{0%,${pct(a / C)}{opacity:0;transform:translateY(0)}${pct((a + 0.05) / C)}{opacity:1;transform:translateY(0)}${pct((a + 0.9) / C)}{opacity:0;transform:translateY(-18px)}100%{opacity:0}}.xp${i}{opacity:0;animation:xp${i} ${r2(C)}s infinite}`;
      b += `<g class="xp${i}">${pix('+XP', x + 22, Y - 44, { s: 2, fill: T.amber })}</g>`;
    }
  });
  b += `<g class="walker">${sprite(S.dev(0).rows, S.dev(0).map, 7, Y - 13 - 44, 2, ' class="f0"')}${sprite(S.dev(1).rows, S.dev(1).map, 7, Y - 13 - 44, 2, ' class="f1"')}</g>`;
  b += scanlines(W, H);
  save('mapa.svg', doc(W, H, 'Mapa da jornada: ' + cfg.journey.map(j => `${j.title} (${j.sub})`).join(', '), b, css));
}

/* ======================================================================
   5. Diário de missões
   ====================================================================== */
const STATUS = {
  done: ['✓ CONCLUÍDA', T.live, false],
  online: ['● ONLINE 24/7', T.live, true],
  prod: ['● EM PRODUÇÃO', T.accent, true],
  side: ['★ SIDE QUEST', T.violet, false],
};
function quests() {
  const RH = 64, H = 60 + cfg.quests.length * RH + 6;
  const C = cfg.quests.length * 2;
  let css = `.dot{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:.2}}`;
  const cleared = cfg.quests.filter(q => q.status !== 'side').length;
  let b = frame(W, H, { title: 'DIÁRIO DE MISSÕES', meta: `${cleared}/${cfg.quests.length} NA CONTA · ${cfg.quests.length - cleared} SIDE QUESTS` });
  cfg.quests.forEach((q, i) => {
    const y = 58 + i * RH;
    const [label, color, live] = STATUS[q.status];
    css += windowKf(`sel${i}`, i / cfg.quests.length, (i + 1) / cfg.quests.length) + `.sel${i}{opacity:${i ? 0 : 1};animation:sel${i} ${C}s infinite}`;
    b += `<g class="sel${i}"><path d="${pixRect(14, y + 2, W - 28, RH - 6, 4)}" fill="${T.bg2}"/>${pix('▶', 22, y + 12, { s: 2, fill: T.accent })}</g>`;
    b += `<path d="${pixRect(40, y + 9, 120, 22, 3)}" fill="none" stroke="${color}" stroke-width="2"/>`;
    const [icon, ...rest] = [...label];
    b += `<text x="52" y="24.5" font-size="10.5" font-weight="700" fill="${color}" letter-spacing=".06em" transform="translate(0 ${y})"><tspan${live ? ' class="dot"' : ''}>${esc(icon)}</tspan>${esc(rest.join(''))}</text>`;
    b += pix(q.title, 178, y + 10, { s: 2, fill: T.fg });
    for (let k = 0; k < 5; k++) b += sprite(S.STAR.rows, { '#': k < q.stars ? T.amber : T.line2 }, W - 24 - (5 - k) * 15, y + 12, 2);
    b += txt(q.desc, 178, y + 42, { size: 12.5, fill: T.fg2 });
    b += txt('LOOT', 178, y + 57, { size: 10, fill: T.fg3, ls: '.1em', weight: 700 }) + txt(q.loot.join(' · '), 214, y + 57, { size: 11, fill: T.fg3 });
    if (i < cfg.quests.length - 1) b += `<path fill="${T.line}" d="${dashed(40, y + RH - 3, W - 80, 2, 4, 1)}"/>`;
  });
  b += scanlines(W, H);
  save('missoes.svg', doc(W, H, 'Diário de missões: ' + cfg.quests.map(q => q.title).join(', '), b, css));
}

/* ======================================================================
   6. Inventário
   ====================================================================== */
const RARITY = { legendary: [T.accent, 'LENDÁRIO'], epic: [T.violet, 'ÉPICO'], rare: [T.blue, 'RARO'], common: [T.fg3, 'COMUM'] };
function inventory() {
  const H = 322, cols = 8, sz = 88, g = 12, x0 = (W - (cols * sz + (cols - 1) * g)) / 2, y0 = 60;
  const items = cfg.inventory.slice(0, 16), dt = 1.4, C = items.length * dt;
  let css = `.glow{animation:glow 2.4s steps(3) infinite alternate}@keyframes glow{to{opacity:.35}}`;
  let b = frame(W, H, { title: 'INVENTÁRIO', meta: `${items.length}/${items.length} SLOTS · PESO OK` });
  const pos = i => [x0 + (i % cols) * (sz + g), y0 + Math.floor(i / cols) * (sz + g)];
  items.forEach((it, i) => {
    const [x, y] = pos(i), [col] = RARITY[it.rarity];
    b += `<path d="${pixRect(x, y, sz, sz, 4)}" fill="${T.bg2}"/><path d="${pixRect(x, y, sz, sz, 4)}" fill="none" stroke="${col}" stroke-width="2"${it.rarity === 'legendary' ? ' class="glow"' : ''}/>`;
    b += `<rect x="${x + sz - 12}" y="${y + 6}" width="6" height="6" fill="${col}"/>`;
    if (it.icon === 'cafe') b += sprite(S.MUG.rows, S.MUG.map, x + sz / 2 - 18, y + 18, 4);
    else if (it.icon === 'cat') b += sprite(S.CAT_SHIP.rows, S.CAT_SHIP.map, x + sz / 2 - 22, y + 20, 4);
    else b += pix(it.icon, x + sz / 2, y + 22, { s: 4, fill: T.fg, align: 'middle' });
    b += txt(it.name, x + sz / 2, y + 78, { size: 10.5, fill: T.fg2, anchor: 'middle' });
    if (it.qty) b += txt('x' + it.qty, x + 8, y + 16, { size: 11, fill: T.fg, weight: 700 });
    // dica no rodapé do card enquanto o cursor está no item
    css += windowKf(`tip${i}`, i / items.length, (i + 1) / items.length) + `.tip${i}{opacity:${i ? 0 : 1};animation:tip${i} ${r2(C)}s infinite}`;
  });
  // cursor
  let kf = '';
  items.forEach((_, i) => { const [x, y] = pos(i); kf += `${pct(i / items.length)}{transform:translate(${r2(x - pos(0)[0])}px,${y - pos(0)[1]}px)}`; });
  css += `@keyframes cur{${kf}100%{transform:translate(0,0)}}.cursor{animation:cur ${r2(C)}s steps(1) infinite}`;
  b += `<g class="cursor"><path d="${pixRect(pos(0)[0] - 6, pos(0)[1] - 6, sz + 12, sz + 12, 6)}" fill="none" stroke="${T.fg}" stroke-width="3"/></g>`;
  // dicas
  b += `<path d="${pixRect(22, 262, W - 44, 42, 4)}" fill="${T.bg}"/><path d="${pixRect(22, 262, W - 44, 42, 4)}" fill="none" stroke="${T.line2}" stroke-width="2"/>`;
  items.forEach((it, i) => {
    const [col, rname] = RARITY[it.rarity];
    const nw = textWidth(it.name, 2);
    b += `<g class="tip${i}">${pix(it.name, 38, 276, { s: 2, fill: col })}${txt(`· ${rname} · ${it.tip}`, 38 + nw + 12, 288, { size: 12.5, fill: T.fg2 })}</g>`;
  });
  b += scanlines(W, H);
  save('inventario.svg', doc(W, H, 'Inventário: ' + items.map(i => i.name).join(', '), b, css));
}

/* ======================================================================
   7. Conquistas
   ====================================================================== */
function wrap(s, max) {
  const out = [''];
  for (const w of s.split(' ')) {
    if ((out[out.length - 1] + ' ' + w).trim().length > max) out.push(w);
    else out[out.length - 1] = (out[out.length - 1] + ' ' + w).trim();
  }
  return out;
}
function achievements() {
  const list = cfg.achievements, rows = Math.ceil(list.length / 2), RH = 76, H = 60 + rows * RH + 4;
  const got = list.filter(a => !a.locked).length, C = list.length * 1.2;
  let css = '';
  let b = frame(W, H, { title: 'CONQUISTAS', meta: `${got}/${list.length} DESBLOQUEADAS · ${Math.round((got / list.length) * 100)}%` });
  list.forEach((a, i) => {
    const x = 22 + (i % 2) * 404, y = 58 + Math.floor(i / 2) * RH, w = 392;
    b += `<path d="${pixRect(x, y, w, RH - 10, 4)}" fill="${T.bg2}"/><path d="${pixRect(x, y, w, RH - 10, 4)}" fill="none" stroke="${a.locked ? T.line2 : '#4a3a12'}" stroke-width="2"${a.locked ? ' stroke-dasharray="4 4"' : ''}/>`;
    if (a.locked) b += sprite(S.LOCK.rows, S.LOCK.map, x + 18, y + 17, 4);
    else {
      b += sprite(S.TROPHY.rows, S.TROPHY.map, x + 14, y + 15, 4);
      // brilho passando pelo troféu, um de cada vez
      css += `@keyframes sh${i}{0%,${pct(i / list.length)}{opacity:0}${pct((i + 0.5) / list.length)}{opacity:.75}${pct((i + 1) / list.length)},100%{opacity:0}}.sh${i}{opacity:0;animation:sh${i} ${r2(C)}s infinite}`;
      b += `<g class="sh${i}">${sprite(S.TROPHY.rows, { '#': '#fff3c4' }, x + 14, y + 15, 4)}</g>`;
    }
    b += pix(a.title, x + 66, y + 13, { s: 2, fill: a.locked ? T.fg3 : T.fg });
    if (a.year) b += txt(a.year, x + w - 14, y + 24, { size: 10.5, fill: T.fg3, anchor: 'end' });
    wrap(a.desc, 44).slice(0, 2).forEach((l, k) => { b += txt(l, x + 66, y + 44 + k * 15, { size: 11.5, fill: a.locked ? T.fg3 : T.fg2 }); });
  });
  b += scanlines(W, H);
  save('conquistas.svg', doc(W, H, 'Conquistas: ' + list.filter(a => !a.locked).map(a => a.title).join(', '), b, css));
}

/* ======================================================================
   8. Minigame: Salomão caça bugs em produção
   ====================================================================== */
function minigame() {
  const H = 330, C = 16, rnd = rng(1234);
  const COLS = 6, ROWS = 3, BX = 150, DX = 100, ROWY = [100, 152, 204], SHIPY = 272;
  const bugs = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) bugs.push({ r, c, x: BX + c * DX, y: ROWY[r], label: cfg.bugs[(r * COLS + c) % cfg.bugs.length] });
  const order = bugs.map((_, i) => i).sort(() => rnd() - 0.5);
  // formação anda de 10 em 10 px a cada 0,4 s, vai e volta
  const STEP = 0.4, off = t => { const m = Math.floor(t / STEP) % 24; return (m <= 12 ? m : 24 - m) * 10; };
  const shots = order.map((bi, k) => ({ bi, t: 1.1 + k * 0.6 }));
  const clearAt = shots[shots.length - 1].t + 0.6;

  let css = `
.la{animation:la .8s steps(1) infinite}.lb{animation:lb .8s steps(1) infinite}@keyframes la{50%{opacity:0}}@keyframes lb{0%{opacity:0}50%{opacity:1}}`;
  let fk = '';
  for (let n = 0; n * STEP < C; n++) fk += `${pct((n * STEP) / C)}{transform:translateX(${off(n * STEP)}px)}`;
  css += `@keyframes form{${fk}100%{transform:translateX(0)}}.form{animation:form ${C}s steps(1,end) infinite}`;
  // nave
  let sk = `0%{transform:translateX(${400 - 22}px)}`, px = 400 - 22;
  shots.forEach(s => {
    const b = bugs[s.bi], tx = b.x + off(s.t - 0.1) + 18 - 22;
    sk += `${pct((s.t - 0.42) / C)}{transform:translateX(${r2(px)}px)}${pct((s.t - 0.12) / C)}{transform:translateX(${r2(tx)}px)}`;
    px = tx;
  });
  sk += `${pct((clearAt + 0.5) / C)}{transform:translateX(${r2(px)}px)}${pct((C - 0.6) / C)}{transform:translateX(${400 - 22}px)}100%{transform:translateX(${400 - 22}px)}`;
  css += `@keyframes ship{${sk}}.ship{transform:translateX(${400 - 22}px);animation:ship ${C}s infinite}`;

  let b = frame(W, H, { title: 'MINIGAME · BUG HUNT', meta: 'SALOMÃO VS PRODUÇÃO' });
  b += pix('SCORE', 24, 60, { s: 2, fill: T.fg3 }) + pix('STAGE 01', W / 2, 60, { s: 2, fill: T.fg3, align: 'middle' }) + pix('BUGS', 744, 60, { s: 2, fill: T.fg3, align: 'end' });
  // placar e contador: um texto por valor, cada um visível na sua janela
  const marks = [0, ...shots.map(s => s.t / C), 1];
  for (let k = 0; k <= shots.length; k++) {
    const a = k === 0 ? 0 : marks[k], z = k === shots.length ? 1 : marks[k + 1];
    css += windowKf(`sc${k}`, a, z) + `.sc${k}{opacity:${k ? 0 : 1};animation:sc${k} ${C}s infinite}`;
    b += `<g class="sc${k}">${pix(pad(k * 100, 4), 96, 60, { s: 2, fill: T.accent })}${pix(pad(shots.length - k, 2), 816, 60, { s: 2, fill: k === shots.length ? T.live : T.accent, align: 'end' })}</g>`;
  }
  // bugs (dentro da formação que anda)
  let form = '';
  bugs.forEach((bg, i) => {
    const shot = shots.find(s => s.bi === i), col = [T.red, T.amber, T.violet][bg.r];
    css += windowKf(`b${i}`, 0, shot.t / C) + `.b${i}{animation:b${i} ${C}s infinite}`;
    css += windowKf(`x${i}`, shot.t / C, (shot.t + 0.32) / C) + `.x${i}{opacity:0;animation:x${i} ${C}s infinite}`;
    form += `<g class="b${i}">${sprite(S.BUG[0], { '#': col }, bg.x, bg.y, 4, ' class="la"')}${sprite(S.BUG[1], { '#': col }, bg.x, bg.y, 4, ' class="lb"')}${txt(bg.label, bg.x + 18, bg.y + 42, { size: 9.5, fill: T.fg3, anchor: 'middle' })}</g>`;
    form += `<g class="x${i}">${sprite(S.BOOM, { '#': T.accent }, bg.x + 4, bg.y, 4)}</g>`;
  });
  b += `<g class="form">${form}</g>`;
  // tiros
  shots.forEach((s, k) => {
    const bg = bugs[s.bi], x = bg.x + off(s.t - 0.1) + 18, top = bg.y + 30;
    css += windowKf(`l${k}`, (s.t - 0.1) / C, s.t / C) + `.l${k}{opacity:0;animation:l${k} ${C}s infinite}`;
    b += `<g class="l${k}"><rect x="${x - 3}" y="${top}" width="6" height="${SHIPY - top}" fill="${T.accent}"/><rect x="${x - 1}" y="${top}" width="2" height="${SHIPY - top}" fill="#ffd7c4"/></g>`;
  });
  b += `<g class="ship">${sprite(S.CAT_SHIP.rows, S.CAT_SHIP.map, 0, SHIPY, 4)}</g>`;
  b += `<path fill="${T.line2}" d="${dashed(20, SHIPY + 34, W - 40, 2, 2, 2)}"/>`;
  // telas de início e fim
  css += windowKf('ready', 0, 0.9 / C) + `.ready{opacity:0;animation:ready ${C}s infinite}`;
  css += windowKf('clear', clearAt / C, (C - 0.7) / C) + `.clear{opacity:0;animation:clear ${C}s infinite}`;
  b += `<g class="ready">${pix('READY?', W / 2, 236, { s: 4, fill: T.fg, align: 'middle' })}</g>`;
  b += `<g class="clear"><path d="${pixRect(220, 128, 400, 104, 6)}" fill="${T.bg}" opacity=".92"/><path d="${pixRect(220, 128, 400, 104, 6)}" fill="none" stroke="${T.accent}" stroke-width="3"/>${pix('FASE LIMPA!', W / 2, 146, { s: 5, fill: T.accent, align: 'middle' })}${txt('PR aprovado pelo Salomão ✓  deploy liberado', W / 2, 212, { size: 13, fill: T.live, anchor: 'middle' })}</g>`;
  b += scanlines(W, H);
  save('minigame.svg', doc(W, H, 'Minigame: o Salomão caça bugs em produção (NULL, 404, N+1, CORS...)', b, css));
}

/* ======================================================================
   9. Registro de aventura (estatísticas reais do GitHub)
   ====================================================================== */
async function stats() {
  const s = await githubStats(cfg.user, path.join(root, 'data', 'github.json'));
  const H = 338;
  const C = 9;
  const css = `@keyframes scan{from{transform:translateX(0)}to{transform:translateX(${53 * 14}px)}}.scan{animation:scan ${C}s steps(53) infinite}`;
  const when = s.sample ? 'PRÉVIA · DADOS DE EXEMPLO' : `ATUALIZADO ${new Date(s.fetchedAt).toLocaleDateString('pt-BR')}`;
  let b = frame(W, H, { title: 'REGISTRO DE AVENTURA', meta: when });
  // métricas zeradas (ex.: quem commita direto, sem PR) dão lugar às próximas
  const boxes = [
    [s.commits, 'COMMITS · 12 MESES'],
    [s.prs, 'PULL REQUESTS'],
    [s.reviews, 'CODE REVIEWS'],
    [s.repos, 'REPOS PÚBLICOS'],
    [s.stars, 'ESTRELAS'],
    [s.followers, 'SEGUIDORES'],
    [s.issues, 'ISSUES'],
  ].filter(([v]) => v > 0).slice(0, 5).map(([v, l]) => [fmtN(v), l]);
  boxes.push([`${s.streak}d`, `SEQUÊNCIA · REC ${s.bestStreak}d`]);
  const bw = (W - 48 - (boxes.length - 1) * 8) / boxes.length;
  boxes.forEach(([v, l], i) => {
    const x = 24 + i * (bw + 8);
    b += `<path d="${pixRect(x, 58, bw, 62, 4)}" fill="${T.bg2}"/>`;
    b += pix(v, x + bw / 2, 72, { s: 3, fill: i === boxes.length - 1 ? T.accent : T.fg, align: 'middle' });
    b += txt(l, x + bw / 2, 110, { size: 9.5, fill: T.fg3, anchor: 'middle', ls: '.04em' });
  });
  // gráfico de contribuições em laranja
  const LV = ['#17171c', '#4a1f0d', '#8a3410', '#d2470f', T.accent];
  const weeks = s.weeks.slice(-53), cx0 = (W - (weeks.length * 14 - 3)) / 2, cy0 = 136;
  const byLv = LV.map(() => '');
  weeks.forEach((w, wi) => w.forEach(d => {
    const day = new Date(d.date + 'T12:00:00').getDay();
    byLv[d.lv] += `M${r2(cx0 + wi * 14)} ${cy0 + day * 14}h11v11h-11z`;
  }));
  b += byLv.map((d, i) => (d ? `<path fill="${LV[i]}" d="${d}"/>` : '')).join('');
  b += `<rect class="scan" x="${r2(cx0 - 1)}" y="${cy0 - 1}" width="13" height="${7 * 14 - 1}" fill="#fff" opacity=".13"/>`;
  b += txt(`${fmtN(s.contributions)} contribuições nos últimos 12 meses`, cx0, 252, { size: 11.5, fill: T.fg2 });
  b += txt('menos', W - cx0 - 5 * 14 - 8, 252, { size: 10.5, fill: T.fg3, anchor: 'end' });
  LV.forEach((c, i) => { b += `<rect x="${r2(W - cx0 - (5 - i) * 14 + 3)}" y="243" width="11" height="11" fill="${c}"/>`; });
  // linguagens
  b += pix('LINGUAGENS', 24, 270, { s: 2, fill: T.fg3 });
  let x = 24;
  const lw = W - 48 - (s.langs.length - 1) * 4, tot = s.langs.reduce((a, l) => a + l.pct, 0) || 1;
  s.langs.forEach(l => {
    const w = Math.max(6, (l.pct / tot) * lw);
    b += `<rect x="${r2(x)}" y="292" width="${r2(w)}" height="12" fill="${l.color}"/>`;
    x += w + 4;
  });
  x = 24;
  s.langs.forEach(l => {
    const label = `${l.name} ${Math.round((l.pct / tot) * 100)}%`;
    b += `<rect x="${x}" y="316" width="9" height="9" fill="${l.color}"/>` + txt(label, x + 14, 325, { size: 11, fill: T.fg2 });
    x += 14 + label.length * 6.9 + 18;
  });
  b += scanlines(W, H);
  save('registro.svg', doc(W, H, `Estatísticas do GitHub: ${s.contributions} contribuições, sequência de ${s.streak} dias`, b, css));
  return s;
}

/* ======================================================================
   10. Continue?  11. Rodapé  12. Botões
   ====================================================================== */
function cont() {
  const H = 232, C = 13;
  let css = `.blink{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}
.coin{transform-box:fill-box;transform-origin:center;animation:coin .8s steps(4) infinite}@keyframes coin{50%{transform:scaleX(.2)}}`;
  let b = frame(W, H);
  b += `<g class="blink">${pix('CONTINUE?', W / 2, 30, { s: 6, fill: T.accent, align: 'middle' })}</g>`;
  for (let k = 0; k < 9; k++) {
    css += windowKf(`n${k}`, k / C, (k + 1) / C) + `.n${k}{opacity:0;animation:n${k} ${C}s infinite}`;
    b += `<g class="n${k}">${pix(String(9 - k), W / 2, 92, { s: 10, fill: T.fg, align: 'middle' })}</g>`;
  }
  css += windowKf('ps', 9 / C, 1) + `.ps{animation:ps ${C}s infinite}`;
  b += `<g class="ps"><g class="blink">${pix('▶ PRESS START', W / 2, 112, { s: 4, fill: T.fg, align: 'middle' })}</g>${sprite(S.COIN.rows, S.COIN.map, W / 2 - 220, 110, 6, ' class="coin"')}${sprite(S.COIN.rows, S.COIN.map, W / 2 + 190, 110, 6, ' class="coin"')}</g>`;
  b += txt('Tem um sistema que não pode cair? Insira uma ideia. ↓', W / 2, 202, { size: 14, fill: T.fg2, anchor: 'middle' });
  b += scanlines(W, H);
  save('continue.svg', doc(W, H, 'Continue? Tem um sistema que não pode cair? Bora conversar.', b, css));
}

function footer() {
  const H = 152;
  const css = `.grow{transform-box:fill-box;transform-origin:0 50%;animation:grow 2s steps(20) both}@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.saved{animation:on .01s 2s both}@keyframes on{from{opacity:0}to{opacity:1}}
.z{animation:z 2.4s linear infinite;opacity:0}@keyframes z{0%{opacity:0;transform:translate(0,0)}25%{opacity:1}100%{opacity:0;transform:translate(10px,-22px)}}`;
  let b = frame(W, H);
  b += `<g class="grow">${bar(W / 2 - 150, 24, 300, 10, 1, { seg: 20, color: T.live })}</g>`;
  b += `<g class="saved">${pix('✓ JOGO SALVO', W / 2, 44, { s: 2, fill: T.live, align: 'middle' })}</g>`;
  b += pix('OBRIGADO POR JOGAR', W / 2, 72, { s: 3, fill: T.fg, align: 'middle' });
  b += `<text x="${W / 2}" y="120" font-size="13" fill="${T.fg3}" text-anchor="middle" font-style="italic">“${esc(cfg.quote)}”</text>`;
  b += txt(`LR-OS · ${now.getFullYear()} · feito à mão, pixel por pixel`, W / 2, 140, { size: 10.5, fill: T.fg3, anchor: 'middle' });
  // Salomão dormindo
  const closed = { rows: ['...........', '...........', '...........', '...........', '.ee.....ee.'], map: { e: S.PAL.catEye } };
  b += sprite(S.CAT_BODY.rows, S.CAT_BODY.map, 744, 70, 4) + sprite(closed.rows, closed.map, 744, 70, 4) + sprite(S.CAT_TAIL.rows, S.CAT_TAIL.map, 784, 102, 4);
  ['Z', 'z', 'Z'].forEach((z, i) => { b += `<g class="z" style="animation-delay:${i * 0.8}s">${pix(z, 790, 54, { s: 2, fill: T.fg2 })}</g>`; });
  save('rodape.svg', doc(W, H, `Obrigado por jogar. ${cfg.quote}`, b, css));
}

function buttons() {
  const icons = {
    linkedin: { rows: ['#######', '#.#####', '#######', '#.#..##', '#.#.#.#', '#.#.#.#', '#######'], map: { '#': T.fg } },
    email: { rows: ['#########', '##.....##', '#.#...#.#', '#..#.#..#', '#...#...#', '#.......#', '#########'], map: { '#': T.fg } },
    site: { rows: ['..###..', '.#.#.#.', '#######', '#..#..#', '#######', '.#.#.#.', '..###..'], map: { '#': T.fg } },
  };
  const css = `.blink{animation:blink 1.2s steps(1) infinite}@keyframes blink{50%{opacity:0}}`;
  [['linkedin', 'LINKEDIN'], ['email', 'E-MAIL'], ['site', 'SITE']].forEach(([k, label]) => {
    const w = 200, h = 50;
    const ic = icons[k];
    let b = `<path d="${pixRect(6, 6, w - 6, h - 6, 4)}" fill="${T.accentDim}"/>`;
    b += `<path d="${pixRect(0, 0, w - 6, h - 6, 4)}" fill="${T.bg1}"/><path d="${pixRect(1, 1, w - 8, h - 8, 4)}" fill="none" stroke="${T.accent}" stroke-width="2"/>`;
    b += sprite(ic.rows, ic.map, 18, (h - 6) / 2 - 10.5, 3);
    b += pix(label, 18 + ic.rows[0].length * 3 + 14, (h - 6) / 2 - 7, { s: 2, fill: T.fg });
    b += `<g class="blink">${pix('▶', w - 26, (h - 6) / 2 - 7, { s: 2, fill: T.accent })}</g>`;
    save(`btn-${k}.svg`, doc(w, h, label, b, css));
  });
}

/* ---------------------------------------------------------------------- */
banner(); typing(); sheet(); journey(); quests(); inventory(); achievements(); minigame();
const st = await stats();
cont(); footer(); buttons();
const total = Object.values(files).reduce((a, n) => a + n, 0);
console.log(Object.entries(files).map(([f, n]) => `${f.padEnd(18)} ${(n / 1024).toFixed(1)} KB`).join('\n'));
console.log(`total ${(total / 1024).toFixed(0)} KB · nível ${LEVEL} · XP ${Math.round(XP * 100)}% · stats ${st.sample ? 'EXEMPLO' : 'reais'}`);
