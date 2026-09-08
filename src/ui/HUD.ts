import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { POWER_UP_DEFS } from '../config/gameData';
import { POWER_UP_DURATION, PLAYER_DASH_COOLDOWN } from '../config/gameConfig';
import { calculateOceanCleaned, clamp } from '../utils/math';
import { PowerUpType } from '../types';

interface PowerIndicator {
  type: PowerUpType;
  icon: Phaser.GameObjects.Image;
  bar: Phaser.GameObjects.Graphics;
}

export class HUD {
  private scene: Phaser.Scene;
  private player: Player;
  private scoreText!: Phaser.GameObjects.Text;
  private rpCoin!: Phaser.GameObjects.Image;
  private rpText!: Phaser.GameObjects.Text;
  private cleanText!: Phaser.GameObjects.Text;
  private rescueText!: Phaser.GameObjects.Text;
  private hearts: Phaser.GameObjects.Image[] = [];
  private cleanBar!: Phaser.GameObjects.Graphics;
  private dashBar!: Phaser.GameObjects.Graphics;
  private dashLabel!: Phaser.GameObjects.Text;
  private comboText: Phaser.GameObjects.Text | null = null;
  private powerIndicators: PowerIndicator[] = [];
  private cleanBarWidth = 140;
  private cleanBarHeight = 10;
  private dashBarWidth = 120;
  private dashBarHeight = 8;
  private factText: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.create();
  }

  private create(): void {
    const { width, height } = this.scene.scale;

    this.scoreText = this.scene.add
      .text(12, 6, 'Score: 0', {
        fontFamily: 'monospace',
        fontSize: '17px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.rpCoin = this.scene.add
      .image(16, 36, 'rr_coin')
      .setScrollFactor(0)
      .setDepth(1000)
      .setScale(1.4);

    this.rpText = this.scene.add
      .text(35, 28, '0 RR', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffd54f',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.rescueText = this.scene.add
      .text(12, 52, 'Rescued: 0', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#a5d6a7',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.cleanText = this.scene.add
      .text(width / 2, 8, 'OCEAN: 0%', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#81d4fa',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    for (let i = 0; i < 3; i++) {
      const heart = this.scene.add
        .image(width - 22 - i * 26, 20, 'heart')
        .setScrollFactor(0)
        .setDepth(1000)
        .setScale(0.8);
      this.hearts.push(heart);
    }

    this.cleanBar = this.scene.add.graphics().setScrollFactor(0).setDepth(999);
    this.drawCleanBar(0, width / 2 - this.cleanBarWidth / 2, 24);

    this.dashLabel = this.scene.add
      .text(width / 2, height - 92, 'DASH', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#b0bec5',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    this.dashBar = this.scene.add.graphics().setScrollFactor(0).setDepth(999);
    this.drawDashBar(width / 2 - this.dashBarWidth / 2, height - 80);
  }

  private drawCleanBar(percent: number, x: number, y: number): void {
    this.cleanBar.clear();
    this.cleanBar.fillStyle(0x1a1a2e, 0.8);
    this.cleanBar.fillRect(x, y, this.cleanBarWidth, this.cleanBarHeight);
    this.cleanBar.fillStyle(0x4dd0e1, 1);
    const w = (percent / 100) * this.cleanBarWidth;
    if (w > 0) this.cleanBar.fillRect(x, y, w, this.cleanBarHeight);
    this.cleanBar.setAlpha(1);
  }

  private drawDashBar(x: number, y: number): void {
    this.drawDashFill(x, y, 0);
  }

  private drawDashFill(x: number, y: number, percent: number): void {
    this.dashBar.clear();
    this.dashBar.fillStyle(0x1a1a2e, 0.85);
    this.dashBar.fillRect(x, y, this.dashBarWidth, this.dashBarHeight);
    const ready = percent >= 1;
    const color = ready ? 0x66bb6a : 0x4dd0e1;
    this.dashBar.fillStyle(color, 1);
    const w = clamp(percent, 0, 1) * this.dashBarWidth;
    if (w > 0) this.dashBar.fillRect(x, y, w, this.dashBarHeight);
  }

  updateScore(score: number): void {
    this.scoreText.setText(`Score: ${score}`);
  }

  resize(): void {
    const { width, height } = this.scene.scale;
    this.scoreText.setPosition(12, 6);
    this.rpCoin.setPosition(16, 36);
    this.rpText.setPosition(35, 28);
    this.rescueText.setPosition(12, 52);
    this.cleanText.setPosition(width / 2, 8);
    this.dashLabel.setPosition(width / 2, height - 92);
    this.drawDashBar(width / 2 - this.dashBarWidth / 2, height - 80);
    this.drawCleanBar(0, width / 2 - this.cleanBarWidth / 2, 24);
    for (let i = 0; i < this.hearts.length; i++) {
      this.hearts[i].setPosition(width - 22 - i * 26, 20);
    }
    this.powerIndicators.forEach((ind, idx) => {
      const x = width - 22;
      const y = 56 + idx * 30;
      ind.icon.setPosition(x, y);
    });
    if (this.comboText) {
      this.comboText.setPosition(width / 2, 190);
    }
  }

  updateResearchPoints(rp: number): void {
    this.rpText.setText(`${rp} RR`);
  }

  updateOceanCleaned(collected: number, total: number): void {
    const percent = calculateOceanCleaned(collected, total);
    const { width } = this.scene.scale;
    this.cleanText.setText(`OCEAN: ${percent}%`);
    this.drawCleanBar(percent, width / 2 - this.cleanBarWidth / 2, 24);
  }

  updateRescued(count: number): void {
    this.rescueText.setText(`Rescued: ${count}`);
  }

  updateLives(lives: number): void {
    for (let i = 0; i < this.hearts.length; i++) {
      const heart = this.hearts[i];
      heart.setTexture(i < lives ? 'heart' : 'heart_empty');
      heart.setVisible(true);
    }
  }

  updateDash(now: number): void {
    const remaining = this.player.dashReadyAt - now;
    const percent = remaining <= 0 ? 1 : clamp(1 - remaining / PLAYER_DASH_COOLDOWN, 0, 1);
    const { width, height } = this.scene.scale;
    this.drawDashFill(width / 2 - this.dashBarWidth / 2, height - 80, percent);
    this.dashLabel.setText(percent >= 1 ? 'DASH READY' : `DASH ${Math.ceil((remaining / 1000))}s`);
    this.dashLabel.setColor(percent >= 1 ? '#a5d6a7' : '#b0bec5');
  }

  setPowerUps(items: { type: PowerUpType; until: number }[], now: number): void {
    const active = new Map(items.map((i) => [i.type, i]));

    for (let i = this.powerIndicators.length - 1; i >= 0; i--) {
      const ind = this.powerIndicators[i];
      if (!active.has(ind.type)) {
        ind.icon.destroy();
        ind.bar.destroy();
        this.powerIndicators.splice(i, 1);
      }
    }

    const { width } = this.scene.scale;
    this.powerIndicators.forEach((ind, idx) => {
      const item = active.get(ind.type);
      const fill = item ? clamp((item.until - now) / POWER_UP_DURATION, 0, 1) : 0;
      const x = width - 22;
      const y = 56 + idx * 30;
      ind.icon.setPosition(x, y);
      ind.bar.clear();
      ind.bar.fillStyle(0x1a1a2e, 0.8);
      ind.bar.fillRect(x - 20, y + 11, 40, 4);
      ind.bar.fillStyle(0xffcc80, 1);
      const w = 40 * fill;
      if (w > 0) ind.bar.fillRect(x - 20, y + 11, w, 4);
    });

    let idx = 0;
    for (const [type, item] of active) {
      if (!this.powerIndicators.some((i) => i.type === type)) {
        const def = POWER_UP_DEFS.find((d) => d.type === type);
        const icon = this.scene.add
          .image(width - 22, 56 + this.powerIndicators.length * 30, type)
          .setScrollFactor(0)
          .setDepth(1000)
          .setScale(1.4);
        const bar = this.scene.add.graphics().setScrollFactor(0).setDepth(999);
        this.powerIndicators.push({ type, icon, bar });
        if (def) {
          const tip = this.scene.add
            .text(width - 22, 56 + this.powerIndicators.length * 30 - 20, def.label, {
              fontFamily: 'monospace',
              fontSize: '9px',
              color: '#ffffff',
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1001);
          this.scene.tweens.add({
            targets: tip,
            alpha: 0,
            delay: 1800,
            duration: 800,
            onComplete: () => tip.destroy(),
          });
        }
      }
      idx++;
    }
  }

  setCombo(mult: number | null, activeUntil?: number, now?: number): void {
    if (mult === null || mult <= 1) {
      if (this.comboText) {
        this.comboText.destroy();
        this.comboText = null;
      }
      return;
    }
    const { width } = this.scene.scale;
    if (!this.comboText) {
      this.comboText = this.scene.add
        .text(width / 2, 190, '', {
          fontFamily: 'monospace',
          fontSize: '22px',
          color: '#ffd54f',
          stroke: '#000000',
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1001);
    }
    const remain = activeUntil && now ? Math.max(0, activeUntil - now) / 1000 : 0;
    this.comboText.setText(`COMBO x${mult}${remain > 0 ? `  (${remain.toFixed(1)}s)` : ''}`);
  }

  showMessage(text: string, duration = 2000): void {
    const msg = this.scene.add
      .text(this.scene.scale.width / 2, this.scene.scale.height * 0.42, text, {
        fontFamily: 'monospace',
        fontSize: '17px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1100);
    this.scene.tweens.add({
      targets: msg,
      alpha: 0,
      duration,
      delay: 0,
      onComplete: () => msg.destroy(),
    });
    this.scene.time.delayedCall(duration + 500, () => {
      if (msg.active) msg.destroy();
    });
  }

  showFact(text: string, duration = 4500): void {
    if (this.factText) {
      this.factText.destroy();
      this.factText = null;
    }
    const { width, height } = this.scene.scale;
    this.factText = this.scene.add
      .text(width * 0.5, height * 0.2, text, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: 'rgba(16,34,64,0.9)',
        padding: { x: 12, y: 9 },
        wordWrap: { width: 520 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1100);
    this.scene.time.delayedCall(duration, () => {
      if (this.factText) {
        this.factText.destroy();
        this.factText = null;
      }
    });
  }

  destroy(): void {
    this.hearts.forEach((h) => h.destroy());
    this.cleanBar.destroy();
    this.dashBar.destroy();
    this.dashLabel.destroy();
    this.powerIndicators.forEach((ind) => {
      ind.icon.destroy();
      ind.bar.destroy();
    });
    this.powerIndicators = [];
    if (this.comboText) this.comboText.destroy();
  }
}