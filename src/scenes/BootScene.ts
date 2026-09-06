import Phaser from 'phaser';

type SpriteGrid = string[];
type Palette = Record<string, string>;

interface SpriteDef {
  grid: SpriteGrid;
  palette: Palette;
}

function drawSprite(
  scene: Phaser.Scene,
  key: string,
  def: SpriteDef,
  scale: number = 1
): void {
  const rows = def.grid.length;
  const cols = def.grid[0].length;
  const w = cols * scale;
  const h = rows * scale;
  const g = scene.make.graphics({ x: 0, y: 0 }, false) as Phaser.GameObjects.Graphics;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = def.grid[r][c];
      if (ch === '.') continue;
      const color = def.palette[ch];
      if (!color) continue;
      g.fillStyle(Phaser.Display.Color.HexStringToColor(color).color);
      g.fillRect(c * scale, r * scale, scale, scale);
    }
  }
  g.generateTexture(key, w, h);
  g.destroy();
}

// ========== SPRITE DEFINITIONS ==========

const SPRITES: Record<string, SpriteDef> = {
  // --- PLAYER (diver, right-facing, 32x32) ---
  player: {
    palette: { S: '#5c6bc0', D: '#3949ab', F: '#ff8a65', W: '#ffffff', K: '#1a1a2e', M: '#4dd0e1', B: '#90a4ae', H: '#8d6e63' },
    grid: [
      '......SSSS........',
      '....SSSSSSSS......',
      '....SWWWWWS.......',
      '...SKKKKKWKS......',
      '...SKWKKWKKS......',
      '...SKKKKKKKS......',
      '....SKMMMS........',
      '....SSSSSSSS......',
      '...SSSSSSSSSS.....',
      '..SSSSSSSSSSSS....',
      '..SSBSSSSSBSSS....',
      '..SSSSSSSSSSSS....',
      '...SSSSSSSSSS.....',
      '...SSSS..SSSS.....',
      '....SS....SS......',
      '....SS....SS......',
      '....BB....BB......',
      '...BBB....BBB.....',
    ],
  },

  // --- PLASTIC ITEMS (16x16) ---
  bottle: {
    palette: { B: '#4fc3f7', L: '#29b6f6', C: '#81d4fa', T: '#b3e5fc' },
    grid: [
      '......TT........',
      '.....BBBB.......',
      '.....BLLB.......',
      '.....BLLB.......',
      '....BBLBB.......',
      '....BLLLB.......',
      '....BLLLB.......',
      '....BLLLB.......',
      '....BLLLB.......',
      '....BLLLB.......',
      '....BLLLB.......',
      '....BLLLB.......',
      '.....BLB........',
      '.....BBBB.......',
      '................',
      '................',
    ],
  },
  bag: {
    palette: { W: '#e0e0e0', L: '#bdbdbd', H: '#f5f5f5' },
    grid: [
      '....HHHH........',
      '...HWWWWH.......',
      '..HWLWLWWH......',
      '..HWLWLWWH......',
      '..HWLWLWWH......',
      '..HWLWLWWH......',
      '..HWLWLWWH......',
      '...HWLWWH.......',
      '...HWLWWH.......',
      '...HWLWWH.......',
      '....HWWH........',
      '....HLLH........',
      '.....LL.........',
      '................',
      '................',
      '................',
    ],
  },
  straw: {
    palette: { S: '#ff8a65', D: '#ff7043', T: '#ffab91' },
    grid: [
      '..............S.',
      '.............SS.',
      '............SS..',
      '...........SS...',
      '..........SS....',
      '.........SS.....',
      '........SS......',
      '.......SS.......',
      '......SS........',
      '.....SS.........',
      '....SS..........',
      '...SS...........',
      '..SS............',
      '.SS.............',
      'SS..............',
      'T...............',
    ],
  },
  net: {
    palette: { N: '#78909c', D: '#546e7a', K: '#455a64' },
    grid: [
      'NK..NK..NK..NK.',
      '.NK..NK..NK..NK',
      '..NK..NK..NK..N',
      'K..NK..NK..NK..',
      '.K..NK..NK..NK.',
      'NK..NK..NK..NK.',
      '.NK..NK..NK..NK',
      '..NK..NK..NK..N',
      'K..NK..NK..NK..',
      '.K..NK..NK..NK.',
      'NK..NK..NK..NK.',
      '.NK..NK..NK..NK',
      '..NK..NK..NK..N',
      'K..NK..NK..NK..',
      '.K..NK..NK..NK.',
      'NK..NK..NK..NK.',
    ],
  },
  cup: {
    palette: { R: '#ef5350', D: '#c62828', L: '#e57373', W: '#ffcdd2' },
    grid: [
      '....LLLL........',
      '...LRRRRL.......',
      '...LRLRLR.......',
      '...LRRRRL.......',
      '...LRRRRL.......',
      '...LRRRRL.......',
      '...LRRRRL.......',
      '...LRRRRL.......',
      '...LRRRRL.......',
      '...LRRRRL.......',
      '....LRLRL.......',
      '....LRRRL.......',
      '.....LRL........',
      '................',
      '................',
      '................',
    ],
  },

  // --- MARINE LIFE (16x16) ---
  fish_trapped: {
    palette: { O: '#ffa726', D: '#f57c00', E: '#1a1a2e', W: '#ffffff', N: '#78909c', G: '#90a4ae' },
    grid: [
      '................',
      '....NNNN........',
      '...NNNNNN.......',
      '..NOONNONN......',
      '..NOWNONNNN.....',
      '..NOONNONNNN....',
      '..NNNNNNNNN.....',
      '..NNGNNNNNNG....',
      '..NNNNNNNNNG....',
      '...NNNNNNNG.....',
      '..NNNNNNNNG.....',
      '..NOONNONN......',
      '..NOWNONNNN.....',
      '...NNNNNN.......',
      '....NNNN........',
      '................',
    ],
  },
  fish_free: {
    palette: { O: '#ffa726', D: '#f57c00', E: '#1a1a2e', W: '#ffffff' },
    grid: [
      '................',
      '................',
      '................',
      '....OOOO........',
      '...OOOOOO.......',
      '..OOWOOOOO......',
      '..OOEOOOOOOO....',
      '..OOOOOOOOOO....',
      '..OOOODOOOOO....',
      '..OOOOOOOOOO....',
      '..OOOODOOOO.....',
      '..OOWOOOOO......',
      '...OOOOOO.......',
      '....OOOO........',
      '................',
      '................',
    ],
  },
  turtle_trapped: {
    palette: { G: '#66bb6a', D: '#43a047', S: '#8d6e63', E: '#1a1a2e', N: '#78909c' },
    grid: [
      '................',
      '...NNNN.........',
      '..NNNNNN........',
      '..NGGGGNNN......',
      '.NSGGSGGNNN.....',
      '.NSGGSGGGSN.....',
      '.NSGGGGGGSN.....',
      '..NSGGGGSN......',
      '..NNNNNNNN......',
      '...NNNNNNN......',
      '...NNGGGN.......',
      '...NGGGGN.......',
      '..NGG..GGN......',
      '..GG....GG......',
      '................',
      '................',
    ],
  },
  turtle_free: {
    palette: { G: '#66bb6a', D: '#43a047', S: '#8d6e63', E: '#1a1a2e' },
    grid: [
      '................',
      '................',
      '................',
      '....GGGG........',
      '...GGGGGG.......',
      '..GSGGSGGG......',
      '..GSGGSGGGE.....',
      '..GGGGGGGGE.....',
      '..GGGGGGGG......',
      '...GGGGGG.......',
      '...GGGGGG.......',
      '..GGG..GGG......',
      '..GG....GG......',
      '................',
      '................',
      '................',
    ],
  },
  school: {
    palette: { Y: '#ffee58', D: '#fdd835', E: '#1a1a2e' },
    grid: [
      '................',
      '.YY...YY........',
      'YDDY.YDDY.......',
      'YDEYYYYEY.......',
      'YDDY.YDDY.......',
      '.YY...YY........',
      '........YY......',
      '.......YDDY.....',
      '.......YDEY.....',
      '.......YDDY.....',
      '........YY......',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  },

  // --- CORAL (16x16) ---
  coral_branching: {
    palette: { C: '#ff7043', L: '#ff8a65', D: '#e64a19' },
    grid: [
      '..C...C..C......',
      '.CLC.CLC.CLC....',
      '.CLC.CLC.CLC....',
      '..CC.CC..CC.....',
      '..CC.CC..CC.....',
      '...CDC..CD......',
      '...CDC..CD......',
      '....CC..CC......',
      '....CC..CC......',
      '.....CDCC.......',
      '.....CDCC.......',
      '......CC........',
      '......CC........',
      '.....CCCC.......',
      '.....DDDD.......',
      '................',
    ],
  },
  coral_brain: {
    palette: { C: '#ab47bc', L: '#ce93d8', D: '#7b1fa2', P: '#e1bee7' },
    grid: [
      '................',
      '....CCCCCC......',
      '...CLLLLC.......',
      '..CLPPPLLC......',
      '..CLPPLLLC......',
      '..CLPLPPLLC.....',
      '..CLPPPLLC......',
      '...CLLLLC.......',
      '....CCCCCC......',
      '.....DDDD.......',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  coral_fire: {
    palette: { C: '#ffa726', L: '#ffcc80', D: '#ef6c00', F: '#ff8f00' },
    grid: [
      '....C...........',
      '...CLC..........',
      '...CFC..........',
      '..CDCC.C........',
      '..CLCLC.C.......',
      '..CDCCCLC.......',
      '...CDCLLC.......',
      '...CDCLC........',
      '....CDC.........',
      '....DD..........',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  },

  // --- POWER-UPS (16x16) ---
  recycling_bin: {
    palette: { G: '#66bb6a', D: '#43a047', W: '#ffffff', L: '#a5d6a7' },
    grid: [
      '....GGGG........',
      '...GLLLLG.......',
      '...GLLLLG.......',
      '..GLLLLLLG......',
      '..GLWLLWLG......',
      '..GLLLWLLG......',
      '..GLWLLWLG......',
      '..GLLLLLLG......',
      '..GLLLLLLG......',
      '..GLLLLLLG......',
      '..GLLLLLLG......',
      '...GLLLLG.......',
      '...GDDDDG.......',
      '....GGGG........',
      '................',
      '................',
    ],
  },
  reef_seed: {
    palette: { P: '#ec407a', L: '#f48fb1', D: '#c2185b', S: '#fce4ec' },
    grid: [
      '......SS........',
      '.....SPPS.......',
      '....SPLPLS......',
      '....SPLPLS......',
      '....SPPPPS......',
      '.....SPPS.......',
      '......SS........',
      '......DD........',
      '......DD........',
      '.....DDDD.......',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  tethered_cap: {
    palette: { B: '#42a5f5', L: '#90caf9', T: '#78909c', C: '#1e88e5' },
    grid: [
      '................',
      '................',
      '....CCCCCC......',
      '...CLLLLLLC.....',
      '...CLLCLLLC.....',
      '...CLLLLLLC.....',
      '....CCCCCC......',
      '......TT........',
      '......TT........',
      '......TT........',
      '......TT........',
      '......TT........',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  current_shield: {
    palette: { Y: '#ffee58', L: '#fff9c4', D: '#f9a825', O: '#ff8f00' },
    grid: [
      '....YYYY........',
      '...YLLLLY.......',
      '..YLLOLLL.......',
      '..YLOLOLLY......',
      '..YLOLOLL.......',
      '..YLLOLLLY......',
      '...YLLLLY.......',
      '....YYYY........',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  community_alert: {
    palette: { O: '#ff7043', L: '#ffab91', D: '#d84315', W: '#ffffff' },
    grid: [
      '......OO........',
      '.....OLLO.......',
      '....OLWWLO......',
      '....OLWWLO......',
      '....OLWWLO......',
      '.....OLLO.......',
      '......OO........',
      '.....ODDO.......',
      '....ODDDDO......',
      '...ODDDDDO......',
      '...ODDDDDO......',
      '....ODDDO.......',
      '.....ODD........',
      '......O.........',
      '................',
      '................',
    ],
  },

  // --- HAZARDS (16x16) ---
  jellyfish: {
    palette: { P: '#b388ff', L: '#d1c4e9', T: '#7c4dff', K: '#311b92', C: '#e040fb' },
    grid: [
      '....KKKKKKKK....',
      '...KPPPPPPPPKK..',
      '..KPPLLLLLLPPK..',
      '..KPLCTTTTCLPK..',
      '..KPPTTTTTTPPK..',
      '..KPPPCCCCPPPK..',
      '...KPPPPPPPPK...',
      '....KKKKKKKK....',
      '.....K....K.....',
      '.....K....K.....',
      '....KK....KK....',
      '....K.....K.....',
      '....KK...KK.....',
      '......K.K.......',
      '.......K........',
      '................',
    ],
  },

  // --- RR CURRENCY (12x12) ---
  rr_coin: {
    palette: { G: '#ffd54f', L: '#fff59d', D: '#f9a825', W: '#ffffff' },
    grid: [
      '...GGGG....',
      '..GLLLLG...',
      '.GLWWWWLG..',
      'GLWLWWLWLG.',
      'GLWWWWWWLG.',
      'GLWWWWWWLG.',
      'GLWWLWWWLG.',
      '.GLWWWWLG..',
      '..GLLLLG...',
      '...GGGG....',
      '............',
      '............',
    ],
  },

  // --- UI ELEMENTS ---
  heart: {
    palette: { R: '#ef5350', L: '#e57373', D: '#c62828' },
    grid: [
      '..RR..RR..',
      '.RRLLRRLL.',
      'RRLLLLLLR.',
      'RRLLLLLLR.',
      '.RRLLLLR..',
      '..RRLLR...',
      '...RRR....',
      '....R.....',
    ],
  },
  heart_empty: {
    palette: { R: '#455a64', L: '#546e7a' },
    grid: [
      '..RR..RR..',
      '.RRL.RRL..',
      'RL...L..R.',
      'RL...L..R.',
      '.RL..LR...',
      '..RRLR....',
      '...RR.....',
      '....R.....',
    ],
  },
  star: {
    palette: { Y: '#ffee58', L: '#fff9c4', D: '#fdd835' },
    grid: [
      '....Y.....',
      '...YYY....',
      '..YYYYY...',
      'YYYYYYYYYY',
      '.YYYYYYYY.',
      '..YYYYYY..',
      '..YYYYY...',
      '.YYY..YYY.',
      '.YY....YY.',
    ],
  },
  bubble: {
    palette: { W: '#e3f2fd', L: '#bbdefb', H: '#ffffff' },
    grid: [
      '.WW.',
      'WLHW',
      'WLWW',
      '.WW.',
    ],
  },
  joystick_base: {
    palette: { G: '#37474f', L: '#455a64' },
    grid: [
      '..GGGGGGGG..',
      '.GLLLLLLLLG.',
      'GLLLLLLLLLG.',
      'GLLLLLLLLLG.',
      'GLLLLLLLLLG',
      'GLLLLLLLLLG',
      'GLLLLLLLLLG',
      'GLLLLLLLLLG',
      'GLLLLLLLLLG',
      '.GLLLLLLLLG.',
      '..GGGGGGGG..',
    ],
  },
  joystick_knob: {
    palette: { G: '#607d8b', L: '#78909c', H: '#90a4ae' },
    grid: [
      '..GGGG..',
      '.GLLLLG.',
      'GLHLLLHG',
      'GLLLLLG',
      'GLLLLLG',
      '.GLLLLG.',
      '..GGGG..',
    ],
  },
  action_button: {
    palette: { G: '#43a047', L: '#66bb6a', H: '#a5d6a7', W: '#ffffff' },
    grid: [
      '..GGGG..',
      '.GLLLLG.',
      'GLHHHLHG',
      'GLLWWLG',
      'GLLWWLG',
      'GLHHHLHG',
      '.GLLLLG.',
      '..GGGG..',
    ],
  },
};

// ========== BACKGROUND GENERATORS ==========

function generateOceanBackground(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  topColor: string,
  bottomColor: string,
  bubbleCount: number
): void {
  const canvas = scene.textures.createCanvas(key, width, height);
  if (!canvas) return;
  const ctx = canvas.context;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(0.5, bottomColor);
  gradient.addColorStop(1, '#020818');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < bubbleCount; i++) {
    const bx = Math.random() * width;
    const by = Math.random() * height;
    const br = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();
  }
  canvas.refresh();
}

function generateSeafloor(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number
): void {
  const canvas = scene.textures.createCanvas(key, width, height);
  if (!canvas) return;
  const ctx = canvas.context;
  ctx.clearRect(0, 0, width, height);
  const sandY = height * 0.7;
  const gradient = ctx.createLinearGradient(0, sandY, 0, height);
  gradient.addColorStop(0, '#5d4037');
  gradient.addColorStop(0.5, '#6d4c41');
  gradient.addColorStop(1, '#4e342e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, sandY, width, height - sandY);
  for (let i = 0; i < width; i += 8 + Math.random() * 12) {
    const h = 4 + Math.random() * 10;
    const shade = Math.random() > 0.5 ? '#795548' : '#6d4c41';
    ctx.fillStyle = shade;
    ctx.fillRect(i, sandY - h / 2, 3 + Math.random() * 4, h);
  }
  for (let i = 0; i < 20; i++) {
    const kx = Math.random() * width;
    const ky = sandY - 10 - Math.random() * 30;
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(kx, ky, 2, 10 + Math.random() * 15);
    ctx.fillRect(kx - 2, ky, 2, 8 + Math.random() * 10);
    ctx.fillRect(kx + 2, ky + 2, 2, 6 + Math.random() * 8);
  }
  canvas.refresh();
}

function generateSfx(scene: Phaser.Scene): void {
  const ctx = (scene.sound as Phaser.Sound.WebAudioSoundManager)?.context;
  if (!ctx) return;
  const sampleRate = ctx.sampleRate;

  function makeBuffer(f: (t: number) => number, duration: number): AudioBuffer {
    const len = Math.floor(sampleRate * duration);
    const buf = ctx.createBuffer(1, len, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = f(i / sampleRate);
    }
    return buf;
  }

  const collectBuf = makeBuffer((t) => {
    const freq = 600 + t * 2000;
    return Math.sin(2 * Math.PI * freq * t) * Math.max(0, 1 - t * 8) * 0.3;
  }, 0.15);
  scene.cache.audio.add('sfx_collect', collectBuf);

  const rescueBuf = makeBuffer((t) => {
    const f1 = 400 + Math.sin(t * 20) * 100;
    return Math.sin(2 * Math.PI * f1 * t) * Math.max(0, 1 - t * 3) * 0.3;
  }, 0.35);
  scene.cache.audio.add('sfx_rescue', rescueBuf);

  const hurtBuf = makeBuffer((t) => {
    return (Math.random() * 2 - 1) * Math.max(0, 1 - t * 5) * 0.2;
  }, 0.2);
  scene.cache.audio.add('sfx_hurt', hurtBuf);

  const plantBuf = makeBuffer((t) => {
    const freq = 300 + t * 800;
    return Math.sin(2 * Math.PI * freq * t) * Math.max(0, 1 - t * 4) * 0.25;
  }, 0.3);
  scene.cache.audio.add('sfx_plant', plantBuf);

  const buyBuf = makeBuffer((t) => {
    const freq = 700 + Math.sin(t * 10) * 40;
    return Math.sin(2 * Math.PI * freq * t) * Math.max(0, 1 - t * 6) * 0.25;
  }, 0.2);
  scene.cache.audio.add('sfx_buy', buyBuf);

  const useBuf = makeBuffer((t) => {
    const f = 300 + t * 600;
    return Math.sin(2 * Math.PI * f * t) * Math.max(0, 1 - t * 3) * 0.25;
  }, 0.25);
  scene.cache.audio.add('sfx_use', useBuf);
}

// ========== BOOT SCENE ==========

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    // nothing to load from files
  }

  create(): void {
    const S = 2;

    // Generate all sprites
    for (const [key, def] of Object.entries(SPRITES)) {
      drawSprite(this, key, def, S);
    }

    // Generate backgrounds
    generateOceanBackground(this, 'bg_deep', 800, 600, '#0a1628', '#0d1f3c', 60);
    generateOceanBackground(this, 'bg_mid', 800, 600, '#0e4a6f', '#0a2e5c', 40);
    generateOceanBackground(this, 'bg_surface', 800, 600, '#1565c0', '#0d47a1', 30);
    generateSeafloor(this, 'seafloor', 800, 600);

    // Generate a simple gradient for results
    const rg = this.textures.createCanvas('results_bg', 800, 600);
    if (rg) {
      const rctx = rg.context;
      const grad = rctx.createLinearGradient(0, 0, 0, 600);
      grad.addColorStop(0, '#1a237e');
      grad.addColorStop(1, '#0d1b2a');
      rctx.fillStyle = grad;
      rctx.fillRect(0, 0, 800, 600);
      rg.refresh();
    }

    // Generate sfx
    generateSfx(this);

    this.scene.start('MenuScene');
  }
}
