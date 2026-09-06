import Phaser from 'phaser';
import { LEVELS } from '../config/gameConfig';
import { gameState, resetGameState } from '../systems/GameState';
import {
  isLevelUnlocked,
  unlockAllCheat,
  CHEAT_UNLOCKALL_COMMAND,
} from '../systems/EconomyManager';

export class MenuScene extends Phaser.Scene {
  private typed = '';

  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.image(0, 0, 'results_bg').setOrigin(0).setDisplaySize(width, height);

    // Animated background bubbles
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

    const title = this.add.text(width / 2, 76, 'RECYCLE RENEGADES', {
      fontFamily: 'monospace',
      fontSize: '38px',
      color: '#4dd0e1',
      stroke: '#003',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, 118, 'Save the Ocean!', {
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

    const diver = this.add.image(width / 2 - 110, 172, 'player').setScale(3);
    this.tweens.add({ targets: diver, y: 162, duration: 1000, yoyo: true, repeat: -1 });

    this.add.text(width / 2, 206, [
      'Move: WASD / Arrows / Touch Joystick',
      'Action: SPACE / Button  (dash + rescue)   Tools: 1-5',
    ], {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#b3e5fc',
      align: 'center',
    }).setOrigin(0.5);

    // Level buttons in two columns (mobile-first thumb zones)
    LEVELS.forEach((level, i) => {
      const col = i % 2;
      const rowI = Math.floor(i / 2);
      const x = width / 2 + (col === 0 ? -120 : 120);
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

      if (unlocked) {
        btn.on('pointerover', () => btn.setBackgroundColor('rgba(0,150,136,0.95)'));
        btn.on('pointerout', () => btn.setBackgroundColor('rgba(38,166,154,0.85)'));
        btn.on('pointerdown', () => {
          this.scene.start('GameScene', { levelIndex: i });
        });
      }
    });

    // Science Lab (shop)
    const shopBtn = this.add.text(width / 2, 426, 'SCIENCE LAB  —  BUY SOLUTIONS', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#ffffff',
      backgroundColor: 'rgba(123,31,162,0.9)',
      padding: { x: 18, y: 10 },
      fixedWidth: 320,
      align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    shopBtn.on('pointerover', () => shopBtn.setBackgroundColor('rgba(142,36,170,1)'));
    shopBtn.on('pointerout', () => shopBtn.setBackgroundColor('rgba(123,31,162,0.9)'));
    shopBtn.on('pointerdown', () => this.scene.start('ShopScene'));

    // Stats + wallet
    this.add.image(width / 2 - 158, 470, 'rr_coin').setScale(1.6);
    this.add.text(width / 2 - 150, 470, `${gameState.researchPoints} RR   Score: ${gameState.totalScore}   High: ${gameState.highScore}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffe082',
    }).setOrigin(0, 0.5);

    const resetBtn = this.add.text(width / 2 - 96, height - 22, 'RESET PROGRESS', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ef9a9a',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    resetBtn.on('pointerover', () => resetBtn.setText('Click to erase save'));
    resetBtn.on('pointerout', () => resetBtn.setText('RESET PROGRESS'));
    resetBtn.on('pointerdown', () => {
      resetGameState();
      this.scene.restart();
    });

    const creditsBtn = this.add.text(width / 2 + 96, height - 22, 'CREDITS', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#81d4fa',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    creditsBtn.on('pointerover', () => creditsBtn.setBackgroundColor('rgba(80,180,255,0.25)'));
    creditsBtn.on('pointerout', () => creditsBtn.setBackgroundColor('transparent'));
    creditsBtn.on('pointerdown', () => this.scene.start('CreditsScene'));

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
    });

    this.setupCheats(width, height);
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

    // Touch easter egg: draw a circle with one finger anywhere
    this.setupCircleGesture(width, height);
  }

  private gesturePoints: { x: number; y: number }[] = [];
  private gestureActive = false;
  private gestureStartTime = 0;

  private setupCircleGesture(width: number, height: number): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.gesturePoints = [{ x: pointer.x, y: pointer.y }];
      this.gestureActive = true;
      this.gestureStartTime = this.time.now;
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.gestureActive) return;
      const last = this.gesturePoints[this.gesturePoints.length - 1];
      if (!last || Math.hypot(pointer.x - last.x, pointer.y - last.y) > 6) {
        this.gesturePoints.push({ x: pointer.x, y: pointer.y });
      }
    });
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.gestureActive) return;
      this.gestureActive = false;
      const elapsed = this.time.now - this.gestureStartTime;
      const pts = this.gesturePoints;
      if (elapsed > 5000 || pts.length < 14) return;
      if (!this.isCircle(pts)) return;
      this.triggerCheat(width, height);
    });
  }

  private isCircle(pts: { x: number; y: number }[]): boolean {
    let cx = 0, cy = 0;
    for (const p of pts) { cx += p.x; cy += p.y; }
    cx /= pts.length; cy /= pts.length;

    let minR = Infinity, maxR = 0;
    for (const p of pts) {
      const d = Math.hypot(p.x - cx, p.y - cy);
      minR = Math.min(minR, d);
      maxR = Math.max(maxR, d);
    }
    if (minR < 24 || maxR > 220) return false; // too tight or too big
    if (maxR - minR > 60) return false;        // too ragged

    let prev = Math.atan2(pts[0].y - cy, pts[0].x - cx);
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = Math.atan2(pts[i].y - cy, pts[i].x - cx);
      let d = a - prev;
      if (d > Math.PI) d -= 2 * Math.PI;
      if (d < -Math.PI) d += 2 * Math.PI;
      total += d;
      prev = a;
    }
    const start = pts[0];
    const end = pts[pts.length - 1];
    const closed = Math.hypot(start.x - end.x, start.y - end.y) < maxR * 0.35;
    return Math.abs(total) > 5.4 && closed; // ~a full revolution
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