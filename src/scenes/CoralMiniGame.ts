import Phaser from 'phaser';
import { CORAL_TYPES } from '../config/gameData';
import { CoralType } from '../types';
import { gameState, saveGameState, getLevelConfig } from '../systems/GameState';

interface Slot {
  x: number;
  y: number;
  target: CoralType;
  placed: CoralType | null;
  container: Phaser.GameObjects.Container;
}

export class CoralMiniGame extends Phaser.Scene {
  private slots: Slot[] = [];
  private palette: CoralType[] = [];
  private score = 0;
  private correct = 0;
  private targetCount = 0;
  private gridCols = 4;
  private gridRows = 2;
  private slotSize = 70;
  private levelIndex = 0;
  private uiTexts: Phaser.GameObjects.Text[] = [];
  private bacteriaShield = 0;
  private nurseryBonus = 0;

  constructor() {
    super('CoralMiniGame');
  }

  init(data: { levelIndex: number }): void {
    this.levelIndex = data.levelIndex;
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.image(0, 0, 'results_bg').setOrigin(0).setDisplaySize(width, height);

    const title = this.add.text(width / 2, 40, 'REEF RESTORATION', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffcc80',
    }).setOrigin(0.5);
    this.uiTexts.push(title);

    const sub = this.add.text(width / 2, 80, 'Match coral fragments to rebuild the reef', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#b3e5fc',
    }).setOrigin(0.5);
    this.uiTexts.push(sub);

    const menuBtn = this.add.text(64, 32, 'MENU', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: 'rgba(13,27,42,0.8)',
      padding: { x: 12, y: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerover', () => menuBtn.setBackgroundColor('rgba(38,166,154,0.9)'));
    menuBtn.on('pointerout', () => menuBtn.setBackgroundColor('rgba(13,27,42,0.8)'));
    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.setupGrid();
    this.setupPalette(width);
    this.setupTimer();

    this.nurseryBonus = this.registry.get('coralNurseryActive') === true ? 3 : 0;
    if (this.nurseryBonus > 0) {
      const nurseryMsg = this.add.text(width / 2, height * 0.93, `Coral nursery active: first ${this.nurseryBonus} plantings grow perfectly!`, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#a5d6a7',
      }).setOrigin(0.5);
      this.uiTexts.push(nurseryMsg);
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleClick(pointer);
    });
  }

  private setupGrid(): void {
    const { width, height } = this.scale;
    const startX = width / 2 - ((this.gridCols - 1) * this.slotSize) / 2;
    const startY = height * 0.35;
    this.targetCount = this.gridCols * this.gridRows;

    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const x = startX + c * this.slotSize;
        const y = startY + r * this.slotSize;
        const target = (['branching', 'brain', 'fire', 'branching', 'brain', 'fire', 'branching', 'brain'] as CoralType[])[r * this.gridCols + c];

        const container = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, this.slotSize - 8, this.slotSize - 8, 0x0a1628, 0.7)
          .setStrokeStyle(2, 0x4fc3f7, 0.8);
        container.add(bg);

        const targetIcon = CoralMiniGame.makeCoralIcon(this, 0, -15, target, 0.6);
        container.add(targetIcon);
        container.setSize(this.slotSize, this.slotSize);
        container.setInteractive({ useHandCursor: true });
        container.setData('index', this.slots.length);

        this.slots.push({ x, y, target, placed: null, container });
      }
    }
  }

  static makeCoralIcon(scene: Phaser.Scene, x: number, y: number, type: CoralType, scale: number): Phaser.GameObjects.Image {
    return scene.add.image(x, y, `coral_${type}`).setScale(scale).setAlpha(0.9);
  }

  private setupPalette(width: number): void {
    this.palette = ['branching', 'brain', 'fire', 'branching', 'brain', 'fire', 'branching', 'brain'];
    for (let i = this.palette.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.palette[i], this.palette[j]] = [this.palette[j], this.palette[i]];
    }

    const paletteY = this.scale.height * 0.72;
    const startX = width / 2 - ((this.palette.length - 1) * 55) / 2;

    this.palette.forEach((type, i) => {
      const x = startX + i * 55;
      const icon = this.add.image(x, paletteY, `coral_${type}`).setScale(1.8);
      icon.setData('coralType', type);
      icon.setInteractive({ useHandCursor: true });
      icon.on('pointerdown', () => this.selectCoral(type));
    });
  }

  private selectedCoral: CoralType | null = null;
  private infoText!: Phaser.GameObjects.Text;

  private selectCoral(type: CoralType): void {
    this.selectedCoral = this.selectedCoral === type ? null : type;
    if (this.infoText) this.infoText.destroy();
    if (this.selectedCoral) {
      this.infoText = this.add.text(this.scale.width / 2, this.scale.height * 0.85, `Selected: ${this.selectedCoral.toUpperCase()} CORAL`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffcc80',
      }).setOrigin(0.5);
      this.uiTexts.push(this.infoText);
    }
  }

  private handleClick(pointer: Phaser.Input.Pointer): void {
    if (!this.selectedCoral) return;
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      const bounds = slot.container.getBounds();
      if (
        pointer.x >= bounds.x &&
        pointer.x <= bounds.x + bounds.width &&
        pointer.y >= bounds.y &&
        pointer.y <= bounds.y + bounds.height
      ) {
        if (slot.placed) return;
        this.placeCoral(i);
        return;
      }
    }
  }

  private placeCoral(slotIndex: number): void {
    if (!this.selectedCoral) return;
    const slot = this.slots[slotIndex];
    if (slot.placed) return;

    slot.placed = this.selectedCoral;
    const icon = CoralMiniGame.makeCoralIcon(this, 0, 15, this.selectedCoral, 1.0);
    this.tweens.add({
      targets: icon,
      y: 10,
      duration: 300,
    });
    slot.container.add(icon);

    const isCorrect = slot.placed === slot.target;
    if (isCorrect) {
      this.score += 100;
      this.correct++;
      this.sound.play('sfx_plant');
      this.cameras.main.shake(100, 0.005);
      if (this.infoText) {
        this.infoText.setText(`+100 | ${CORAL_TYPES.find((c) => c.type === slot.placed)?.label || ''} placed!`);
        this.infoText.setColor('#a5d6a7');
      }
    } else if (this.nurseryBonus > 0) {
      // A nursery-grown fragment always takes root
      this.nurseryBonus--;
      this.score += 100;
      this.correct++;
      this.sound.play('sfx_plant');
      this.cameras.main.shake(100, 0.005);
      if (this.infoText) {
        this.infoText.setText('+100 | Nursery coral adapts and thrives!');
        this.infoText.setColor('#a5d6a7');
      }
    } else {
      this.score += 20;
      if (this.infoText) {
        this.infoText.setText('+20 | Not an ideal match, but coral takes root!');
        this.infoText.setColor('#ffcc80');
      }
    }

    this.checkComplete();
  }

  private setupTimer(): void {
    const timeToPlace = 45;
    this.timer = timeToPlace * 1000;
    this.timerText = this.add.text(this.scale.width / 2, this.scale.height * 0.95, `Time: ${timeToPlace}s`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.uiTexts.push(this.timerText);
  }

  private timer = 0;
  private timerText!: Phaser.GameObjects.Text;
  private ended = false;

  update(time: number, delta: number): void {
    if (this.ended) return;
    this.timer -= delta;
    if (this.timerText) this.timerText.setText(`Time: ${Math.ceil(this.timer / 1000)}s`);
    if (this.timer <= 0) {
      this.end(false);
    }
  }

  private checkComplete(): void {
    const placedCount = this.slots.filter((s) => s.placed).length;
    if (placedCount >= this.targetCount) {
      this.end(true);
    }
  }

  private end(success: boolean): void {
    if (this.ended) return;
    this.ended = true;
    this.registry.remove('coralNurseryActive');
    const level = getLevelConfig(this.levelIndex);
    const bonus = this.correct * 50 + this.score;
    const total = this.score + (success ? 250 : 0);

    this.cameras.main.fadeOut(600);
    this.time.delayedCall(600, () => {
      this.scene.start('ResultsScene', {
        success,
        levelIndex: this.levelIndex,
        coralScore: total,
        fromCoral: true,
        correct: this.correct,
      });
    });
  }
}
