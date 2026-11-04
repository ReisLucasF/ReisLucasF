// Converte recortes da sua arte (GIF/PNG) em bitmaps indexados para os SVGs.
// Uso: node tools/pixel-art.mjs <imagem>   (precisa do ffmpeg no PATH; roda uma vez, localmente)
// Gera data/art.json, que o build.mjs lê. A Action não precisa de ffmpeg.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = process.argv[2];
if (!src) { console.error('uso: node tools/pixel-art.mjs <imagem>'); process.exit(1); }

// recortes na arte original (1448×1086): x, y, largura, altura → tamanho final em pixels
const CROPS = {
  portrait: { crop: [450, 55, 400, 400], size: [50, 50], colors: 22, key: 34, keyRows: ['top'] },
};
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const hex = (r, g, b) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const out = {};
for (const [name, o] of Object.entries(CROPS)) {
  const [x, y, cw, ch] = o.crop, [w, h] = o.size;
  const tmpPal = path.join(root, `.pal-${name}.png`);
  const scale = `crop=${cw}:${ch}:${x}:${y},scale=${w}:${h}:flags=area`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-frames:v', '1', '-vf', `${scale},palettegen=max_colors=${o.colors}:reserve_transparent=0`, tmpPal]);
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', src, '-i', tmpPal, '-frames:v', '1', '-lavfi', `[0:v]${scale}[a];[a][1:v]paletteuse=dither=none`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { maxBuffer: 1 << 26 });
  fs.rmSync(tmpPal, { force: true });
  if (buf.length !== w * h * 3) throw new Error(`tamanho inesperado ${buf.length}`);
  // fundo (parede creme, mesa): a cor mais comum na borda de cima/baixo vira transparente
  const mode = r => {
    const n = new Map();
    for (let c = 0; c < w; c++) { const i = (r * w + c) * 3, k = `${buf[i]},${buf[i + 1]},${buf[i + 2]}`; n.set(k, (n.get(k) || 0) + 1); }
    return [...n].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
  };
  const keys = o.keyRows.map(k => mode(k === 'top' ? 0 : h - 1));
  const isKey = p => { const i = p * 3; return keys.some(k => dist([buf[i], buf[i + 1], buf[i + 2]], k) < o.key); };
  // só é fundo o que está LIGADO à borda (cima, esquerda, direita): cores parecidas com a
  // parede por dentro do desenho (o creme da caneca, brilhos) continuam visíveis
  const bg = new Uint8Array(w * h), stack = [];
  for (let c = 0; c < w; c++) stack.push(c);
  for (let r = 0; r < h; r++) stack.push(r * w, r * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (bg[p] || !isKey(p)) continue;
    bg[p] = 1;
    const r = Math.floor(p / w), c = p % w;
    if (c > 0) stack.push(p - 1);
    if (c < w - 1) stack.push(p + 1);
    if (r > 0) stack.push(p - w);
    if (r < h - 1) stack.push(p + w);
  }
  const palette = [], index = new Map(), rows = [];
  for (let r = 0; r < h; r++) {
    let row = '';
    for (let c = 0; c < w; c++) {
      const i = (r * w + c) * 3, px = [buf[i], buf[i + 1], buf[i + 2]];
      if (bg[r * w + c]) { row += '.'; continue; }
      const k = hex(...px);
      if (!index.has(k)) { index.set(k, palette.length); palette.push(k); }
      row += CHARS[index.get(k)];
    }
    rows.push(row);
  }
  out[name] = { w, h, palette, chars: CHARS.slice(0, palette.length), rows };
  console.log(name, `${w}×${h}`, palette.length, 'cores');
}
fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'data', 'art.json'), JSON.stringify(out));
console.log('→ data/art.json');
