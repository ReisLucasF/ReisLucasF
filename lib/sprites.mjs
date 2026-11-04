// Sprites desenhados à mão. Paleta tirada da sua arte (suéter mostarda, cabelo castanho,
// óculos pretos) e do Salomão (branco com manchas laranja).
import { T } from './svg.mjs';

export const PAL = {
  hair: '#5b3416', hair2: '#3d220d', skin: '#e8a675', skin2: '#c98656', glass: '#141414',
  sweater: '#c8901a', sweater2: '#9c6d10', jeans: '#33415c', shoe: '#2a2a2e',
  catW: '#f3ece1', catW2: '#cfc4b4', catO: '#e9883a', catO2: '#b9611f', catPink: '#f2a0a8', catEye: '#3b2a1e',
  mug: '#ededee', mug2: '#a1a1aa', coffee: '#6b3a1c',
};

// Você, de frente (14×19): cabelo cacheado, armação preta com lentes claras e pupila,
// bigode e barba rala, suéter mostarda. Dois quadros de caminhada só mudam as pernas.
const DEV_TOP = [
  '...h.hHh.hh...',
  '..hhhhhhhhhhh.',
  '.hhHhhhHhhhHhh',
  '.hhhhHhhhhhhhh',
  '.hhsssssssssHh',
  '.hsssssssssssh',
  '.sgggggggggggs',
  '.sgsssgsgsssgs',
  '.sgsEsgsgsEsgs',
  '.sgsssgsgsssgs',
  '.sgggggsgggggs',
  '..sssssnsssss.',
  '..sbsmmmmmsbs.',
  '..bsssrrrsssb.',
  '...bsbsssbsb..',
  '....bbbbbbb...',
  '.....ssss.....',
  '..OOOOOOOOOO..',
  '.OOOOOOOOOOOO.',
  'OOoOOOOOOOOoOO',
];
const DEV_LEGS = [
  ['...jjjj.jjjj..', '...kkk...kkk..'],
  ['...jjjj.jjj...', '....kkk.kkk...'],
];
const DEV_MAP = {
  h: PAL.hair, H: PAL.hair2, s: PAL.skin, n: PAL.skin2, g: PAL.glass, E: PAL.glass,
  b: '#c4855a', m: PAL.hair, r: '#b5654a', O: PAL.sweater, o: PAL.sweater2, j: PAL.jeans, k: PAL.shoe,
};
export const dev = frame => ({ rows: [...DEV_TOP, ...DEV_LEGS[frame]], map: DEV_MAP });

// Salomão sentado, de frente (11×12). Olhos e rabo animam separados.
export const CAT_BODY = {
  rows: [
    '.p.......p.',
    '.pp.....pp.',
    '.OOWWWWWOO.',
    'WOOWWWWWOOW',
    'WWWWWWWWWWW',
    'WWWWWnWWWWW',
    '.WWWWWWWWW.',
    '..WWWWWWW..',
    '.WWOOWWWWW.',
    'WWOOOWWWWWW',
    'WWWWWWWWOOW',
    'WW.WWW.WWW.',
  ],
  map: { p: PAL.catPink, O: PAL.catO, W: PAL.catW, n: PAL.catPink },
};
export const CAT_EYES = { rows: ['...........', '...........', '...........', '...........', '..e.....e..'], map: { e: PAL.catEye } };
export const CAT_TAIL = { rows: ['..O', '..O', '.OO', 'OO.'], map: { O: PAL.catO } };

// Salomão como "nave" do minigame (11×7)
export const CAT_SHIP = {
  rows: [
    'p.........p',
    'pp.......pp',
    'OOWWWWWWWOO',
    'WWeWWWWWeWW',
    'WWWWWnWWWWW',
    '.WWWWWWWWW.',
    '..WW...WW..',
  ],
  map: { p: PAL.catPink, O: PAL.catO, W: PAL.catW, e: PAL.catEye, n: PAL.catPink },
};

export const MUG = {
  rows: [
    '#######..',
    '#ccccc###',
    '#OOOOO#.#',
    '#OOOOO#.#',
    '#######.#',
    '#######..',
    '.#####...',
  ],
  map: { '#': PAL.mug, c: PAL.coffee, O: T.accent },
};

// Bugs (9×7), dois quadros
export const BUG = [
  ['.#.....#.', '..#...#..', '.#######.', '##.###.##', '#########', '#.#...#.#', '..#...#..'],
  ['.#.....#.', '#.#...#.#', '##.###.##', '#########', '.#######.', '..#...#..', '.#.....#.'],
];
export const BOOM = ['#..#..#', '.#.#.#.', '..###..', '###.###', '..###..', '.#.#.#.', '#..#..#'];

export const TROPHY = {
  rows: ['#########', '#.#####.#', '#.#####.#', '.#######.', '..#####..', '...###...', '....#....', '..#####..', '.#######.'],
  map: { '#': T.amber },
};
export const LOCK = {
  rows: ['..###..', '.#...#.', '.#...#.', '#######', '###.###', '###.###', '#######'],
  map: { '#': T.fg3 },
};
export const STAR = { rows: ['..#..', '.###.', '#####', '.###.', '.#.#.'], map: { '#': T.amber } };
export const HEART = { rows: ['.#.#.', '#####', '#####', '.###.', '..#..'], map: { '#': T.red } };
export const FLAG = { rows: ['#####', '####.', '#####', '#....', '#....', '#....'], map: { '#': T.accent } };
export const CHEST = {
  rows: ['.#######.', '#ooooooo#', '#########', '#oo#Y#oo#', '#ooooooo#', '#########'],
  map: { '#': '#8a5a1e', o: '#b7792a', Y: T.amber },
};
export const COIN = { rows: ['.###.', '##.##', '##.##', '##.##', '.###.'], map: { '#': T.amber } };

// Notebook (22×14) com tela onde o código rola
export const LAPTOP = {
  rows: [
    '.####################.',
    '.#..................#.',
    '.#..................#.',
    '.#..................#.',
    '.#..................#.',
    '.#..................#.',
    '.#..................#.',
    '.#..................#.',
    '.#..................#.',
    '.####################.',
    '######################',
    '#kkkkkkkkkkkkkkkkkkkk#',
    '######################',
    '.####################.',
  ],
  map: { '#': '#2a2a31', k: '#1c1c22' },
};
