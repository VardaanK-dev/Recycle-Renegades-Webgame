import Phaser from 'phaser';
import { LEVELS } from '../config/gameConfig';
import { gameState, resetGameState } from '../systems/GameState';
import {
  isLevelUnlocked,
  unlockAllCheat,
  CHEAT_UNLOCKALL_COMMAND,
} from '../systems/EconomyManager';
import { setUpResponsiveFit } from '../utils/responsive';

const DESIGN_W = 800;
const DESIGN_H = 600;

export class MenuScene extends Phaser.Scene {
  private typed = '';

  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.scale;

    // Background always fills the window (not scaled with the design container)
    this.add.image(0, 0, 'results_bg').setOrigin(0).setDisplaySize(width, height);
    this.spawnBubbles(width, height);

    // Responsive design-space container (800x600 layout scales to fit window)
    const ui = this.add.container(0, 0);
    setUpResponsiveFit(this, ui, DESIGN_W, DESIGN_H);

    const title = this.add.text(400, 76, 'RECYCLE RENEGADES', {
      fontFamily: 'monospace',
      fontSize: '38px',
      color: '#4dd0e1',
      stroke: '#003',
      strokeThickness: 4,
    }).setOrigin(0.5);
    ui.add(title);
    title.setInteractive({ useHandCursor: true });
    title.on('pointerdown', () => this.onTitleTap());

    this.add.text(400, 118, 'Save the Ocean!', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffe082',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: 86,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add.image(400 - 110, 172, 'player').setScale(3);

    // Controls hint moved into container (design coords)
    ui.add(this.add.text(400, 206, [
      'Move: WASD / Arrows / Touch Joystick',
      'Action: SPACE / Button  (dash + rescue)   Tools: 1-5',
    ], {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#b3e5fc',
      align: 'center',
    }).setOrigin(0.5));

    // Level buttons in two columns (mobile-first thumb zones)
    LEVELS.forEach((level, i) => {
      const col = i % 2;
      const rowI = Math.floor(i / 2);
      const x = 400 + (col === 0 ? -120 : 120);
      const y = 280 + rowI * 58;
      const unlocked = isLevelUnlocked(i);
      const text = unlocked ? `${i + 1}. ${level.name}` : `${i + 1}. ???`;

      const btn = unlocked
        ? this.add.text(x, y, text, {
            fontFamily: 'monospace',
            fontSize: '15px',
            color: '#ffffff',
            backgroundColor: 'rgba(38,166,154,0.85)',
            padding: { x: 14, y: 9 },
            fixedWidth: 205,
            align: 'center',
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        : this.add.text(x, y, text, {
            fontFamily: 'monospace',
            fontSize: '15px',
            color: '#546e7a',
            backgroundColor: 'rgba(30,30,60,0.6)',
            padding: { x: 14, y: 9 },
            fixedWidth: 205,
            align: 'center',
          }).setOrigin(0.5);
      ui.add(btn);

      if (unlocked) {
        btn.on('pointerover', () => btn.setBackgroundColor('rgba(0,150,136,0.95)'));
        btn.on('pointerout', () => btn.setBackgroundColor('rgba(38,166,154,0.85)'));
        btn.on('pointerdown', () => {
          this.scene.start('GameScene', { levelIndex: i });
        });
      }
    });

    // Science Lab (shop)
    const shopBtn = this.add.text(400, 426, 'SCIENCE LAB  —  BUY SOLUTIONS', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#ffffff',
      backgroundColor: 'rgba(123,31,162,0.9)',
      padding: { x: 18, y: 10 },
      fixedWidth: 320,
      align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    ui.add(shopBtn);
    shopBtn.on('pointerover', () => shopBtn.setBackgroundColor('rgba(142,36,170,1)'));
    shopBtn.on('pointerout', () => shopBtn.setBackgroundColor('rgba(123,31,162,0.9)'));
    shopBtn.on('pointerdown', () => this.scene.start('ShopScene'));

    // Stats + wallet (coin texture is 2x (24px) scaled 1.4 = 33.6px wide)
    ui.add(this.add.image(400 - 190, 470, 'rr_coin').setScale(1.4));
    ui.add(this.add.text(400 - 158, 470, `RR ${gameState.researchPoints}   Score: ${gameState.totalScore}   High: ${gameState.highScore}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffe082',
    }).setOrigin(0, 0.5));

    const resetBtn = this.add.text(400 - 96, 600 - 22, 'RESET PROGRESS', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ef9a9a',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    ui.add(resetBtn);
    resetBtn.on('pointerover', () => resetBtn.setText('Click to erase save'));
    resetBtn.on('pointerout', () => resetBtn.setText('RESET PROGRESS'));
    resetBtn.on('pointerdown', () => {
      resetGameState();
      this.scene.restart();
    });

    const creditsBtn = this.add.text(400 + 96, 600 - 22, 'CREDITS', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#81d4fa',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    ui.add(creditsBtn);
    creditsBtn.on('pointerover', () => creditsBtn.setBackgroundColor('rgba(80,180,255,0.25)'));
    creditsBtn.on('pointerout', () => creditsBtn.setBackgroundColor('transparent'));
    creditsBtn.on('pointerdown', () => this.scene.start('CreditsScene'));

    // GitHub badge: pixel octocat that opens the repo in a new tab
    const ghIcon = this.add.image(400 + 241, 600 - 22, 'github_octocat')
      .setScale(1.1)
      .setInteractive({ useHandCursor: true });
    ui.add(ghIcon);
    const ghTip = this.add.text(400 + 241, 600 - 52, 'VIEW ON GITHUB', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: 'rgba(13,27,42,0.95)',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setVisible(false).setDepth(10);
    ui.add(ghTip);
    const GITHUB_URL = 'https://github.com/VardaanK-dev/Recycle-Renegades-Webgame';
    ghIcon.on('pointerover', () => ghTip.setVisible(true));
    ghIcon.on('pointerout', () => ghTip.setVisible(false));
    ghIcon.on('pointerdown', () => window.open(GITHUB_URL, '_blank'));

    const fullBtn = this.add.text(width - 4, height - 22, 'FULL', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#cfd8dc',
      padding: { x: 8, y: 5 },
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    fullBtn.on('pointerover', () => fullBtn.setBackgroundColor('rgba(255,255,255,0.15)'));
    fullBtn.on('pointerout', () => fullBtn.setBackgroundColor('transparent'));
    fullBtn.on('pointerdown', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
      // Refire immediately so the layout responds even if no window resize event fires
      this.time.delayedCall(60, () => this.scale.refresh());
    });

    this.setupCheats(width, height);
    ui.setDepth(1);
    fullBtn.setDepth(50);
  }

  private spawnBubbles(width: number, height: number): void {
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * width;
      const y = height + Math.random() * 200;
      const bubble = this.add.image(x, y, 'bubble').setScale(2 + Math.random() * 3).setAlpha(0.4);
      this.tweens.add({
        targets: bubble,
        y: -50,
        alpha: 0,
        duration: 8000 + Math.random() * 6000,
        repeat: -1,
        delay: Math.random() * 3000,
      });
    }
  }

  private setupCheats(width: number, height: number): void {
    // PC easter egg: type /unlockall
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.key.length === 1) {
        this.typed += event.key.toLowerCase();
        if (this.typed.length > CHEAT_UNLOCKALL_COMMAND.length) {
          this.typed = this.typed.slice(this.typed.length - CHEAT_UNLOCKALL_COMMAND.length);
        }
        if (this.typed === CHEAT_UNLOCKALL_COMMAND) {
          this.triggerCheat(width, height);
        }
      }
    });

    // Mobile easter egg: tap the RECYCLE RENEGADES title 5 times quickly
    // (Replaces the old circle gesture, which was hard to draw on touch.)
  }

  private titleTaps = 0;
  private titleTapTimer = 0;

  private onTitleTap(): void {
    const now = this.time.now;
    if (now - this.titleTapTimer > 3000) {
      this.titleTaps = 0;
    }
    this.titleTapTimer = now;
    this.titleTaps += 1;
    if (this.titleTaps >= 5) {
      this.titleTaps = 0;
      this.triggerCheat(this.scale.width, this.scale.height);
    }
  }

  private triggerCheat(width: number, height: number): void {
    unlockAllCheat();
    const msg = this.add.text(width / 2, height * 0.3, 'CHEAT UNLOCKED!  All levels + 5000 RR', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffd54f',
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: { x: 18, y: 12 },
    }).setOrigin(0.5).setDepth(2000);
    this.tweens.add({
      targets: msg,
      alpha: 0,
      delay: 1800,
      duration: 800,
      onComplete: () => this.scene.restart(),
    });
  }
}