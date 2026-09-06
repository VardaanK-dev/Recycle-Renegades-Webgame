import Phaser from 'phaser';
import { PLASTIC_TYPES } from '../config/gameData';
import { calculateOceanCleaned, calculateReefRestored, getImpactComparison, plasticTypeToEstimateKg, formatTime } from '../utils/math';
import { LevelStats, PlasticType } from '../types';
import { gameState, isLastLevel, advanceGameLevel, saveGameState, getLevelConfig } from '../systems/GameState';
import { addResearchPoints } from '../systems/EconomyManager';

interface ResultsData {
  levelIndex: number;
  oceanCleaned: number;
  reefRestored: number;
  stats: LevelStats;
  success: boolean;
  gameOver?: boolean;
  coralScore?: number;
  correct?: number;
  fromCoral?: boolean;
}

export class ResultsScene extends Phaser.Scene {
  private resultsData!: ResultsData;

  constructor() {
    super('ResultsScene');
  }

  init(data: ResultsData): void {
    this.resultsData = data;
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.image(0, 0, 'results_bg').setOrigin(0).setDisplaySize(width, height);

    const level = getLevelConfig(this.resultsData.levelIndex);
    const isGameOver = !!this.resultsData.gameOver;
    const isCoral = !!this.resultsData.fromCoral;

    let title = 'LEVEL COMPLETE';
    let titleColor = '#4dd0e1';
    if (isGameOver) {
      title = 'OUT OF BREATH';
      titleColor = '#ef9a9a';
    } else if (isCoral) {
      title = 'Coral Score';
      titleColor = '#ffcc80';
    }

    this.add.text(width / 2, 28, title, {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: titleColor,
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(width / 2, 56, level.name, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#b3e5fc',
    }).setOrigin(0.5);

    if (isCoral) {
      this.renderCoralResults(width, height);
    } else {
      this.renderLevelResults(width, height);
    }

    this.renderButtons(width, height, isGameOver, isCoral);
  }

  private renderCoralResults(width: number, height: number): void {
    const coralScore = this.resultsData.coralScore ?? 0;
    const correct = this.resultsData.correct ?? 0;
    const total = this.resultsData.stats ? this.resultsData.stats.totalCoralSlots : 8;

    this.add.text(width / 2, 96, `Coral planted correctly: ${correct} / ${total}`, {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, 120, `Coral score: ${coralScore}`, {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#ffe082',
    }).setOrigin(0.5);

    const reefRestored = calculateReefRestored(correct, total);
    this.drawDonut(width / 2, 260, 70, reefRestored, 'Reef Restored');

    const rp = Math.round(correct * 20 + coralScore / 2);
    addResearchPoints(rp);
    this.add.text(width / 2, 150, `Research Points earned: +${rp}  (wallet: ${gameState.researchPoints})`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffd54f',
    }).setOrigin(0.5);

    gameState.totalScore = (gameState.totalScore || 0) + coralScore;
    if (gameState.totalScore > gameState.highScore) gameState.highScore = gameState.totalScore;
    saveGameState();
  }

  private renderLevelResults(width: number, height: number): void {
    const stats = this.resultsData.stats;
    const oceanCleaned = this.resultsData.oceanCleaned ?? calculateOceanCleaned(stats.plasticCollected, stats.totalPlastic);
    const reefRestored = this.resultsData.reefRestored ?? calculateReefRestored(stats.coralPlanted, stats.totalCoralSlots);

    this.add.text(width / 2, 90, `Score: ${stats.score}`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffe082',
    }).setOrigin(0.5);

    this.add.text(width / 2, 114, `Plastic collected: ${stats.plasticCollected}   Marine rescued: ${stats.marineRescued}   Coral planted: ${stats.coralPlanted}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#b3e5fc',
    }).setOrigin(0.5);

    this.add.text(width / 2, 134, `Time: ${formatTime(stats.timeElapsed)}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#b0bec5',
    }).setOrigin(0.5);

    this.add.text(width / 2, 154, `Research Points wallet: ${gameState.researchPoints}  (spend in the Science Lab)`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffd54f',
    }).setOrigin(0.5);

    // Donut charts side by side
    this.drawDonut(width * 0.28, 250, 60, oceanCleaned, 'Ocean Cleaned');
    this.drawDonut(width * 0.6, 250, 60, reefRestored, 'Reef Restored');

    const chartW = Math.min(175, width * 0.26);
    this.drawBarChart(width * 0.13, height - 120, chartW, 58, stats);

    // Impact comparison
    let totalKg = 0;
    (Object.keys(stats.plasticByType) as PlasticType[]).forEach((type) => {
      totalKg += plasticTypeToEstimateKg(type, stats.plasticByType[type]);
    });
    this.add.text(width * 0.6, height - 105, getImpactComparison(totalKg), {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#a5d6a7',
      wordWrap: { width: 250 },
      align: 'center',
    }).setOrigin(0.5);
  }

  private drawDonut(x: number, y: number, radius: number, percent: number, label: string): void {
    this.add.text(x, y - radius - 20, `${percent}%`, {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const g = this.add.graphics();
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (percent / 100) * Math.PI * 2;

    g.fillStyle(0x1a2a44, 1);
    g.beginPath();
    g.arc(x, y, radius, 0, Math.PI * 2);
    g.closePath();
    g.fill();

    if (percent > 0) {
      const color = percent >= 70 ? 0x4dd0e1 : percent >= 40 ? 0xffb74d : 0xef5350;
      g.fillStyle(color, 1);
      g.beginPath();
      g.arc(x, y, radius, startAngle, endAngle);
      g.arc(x, y, radius * 0.62, endAngle, startAngle, true);
      g.closePath();
      g.fill();
    }

    g.fillStyle(0x0d1b2a, 1);
    g.beginPath();
    g.arc(x, y, radius * 0.55, 0, Math.PI * 2);
    g.closePath();
    g.fill();

    this.add.text(x, y + radius + 16, label, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#b3e5fc',
    }).setOrigin(0.5);
  }

  private drawBarChart(x: number, y: number, w: number, h: number, stats: LevelStats): void {
    const types = PLASTIC_TYPES.slice(0, 5);
    const maxCount = Math.max(1, ...types.map((t) => stats.plasticByType[t.type as PlasticType] || 0));
    const bw = w / types.length;

    this.add.text(x + w / 2, y - h - 18, 'Items by type (collected this run)', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#b3e5fc',
    }).setOrigin(0.5);

    const g = this.add.graphics();
    g.fillStyle(0x1a2a44, 1);
    g.fillRect(x, y - h, w, h + 4);

    types.forEach((t, i) => {
      const count = stats.plasticByType[t.type as PlasticType] || 0;
      const bx = x + i * bw + 3;
      if (count > 0) {
        const bh = (count / maxCount) * h;
        g.fillStyle(Number(t.color.replace('#', '0x')), 1);
        g.fillRect(bx, y - bh, bw - 6, Math.max(2, bh));

        // Readable count above each bar
        this.add.text(bx + (bw - 6) / 2, y - bh - 10, String(count), {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3,
        }).setOrigin(0.5);
      }

      // Readable short label under each bar
      this.add.text(bx + (bw - 6) / 2, y + 10, t.short, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#e0e0e0',
      }).setOrigin(0.5);
    });
    g.destroy();

    // Full-name legend with counts so every bar is unambiguous
    const legendParts = types.map((t) => {
      const count = stats.plasticByType[t.type as PlasticType] || 0;
      return `${t.label}: ${count}`;
    });
    this.add.text(x, y + 30, legendParts.join('   '), {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#cfd8dc',
      wordWrap: { width: Math.max(120, w - 10) },
      align: 'left',
    }).setOrigin(0, 0);
  }

  private renderButtons(width: number, height: number, isGameOver: boolean, isCoral: boolean): void {
    interface Action { label: string; onClick: () => void; color?: string }
    const actions: Action[] = [];

    if (isCoral) {
      actions.push(
        { label: 'NEXT LEVEL', onClick: () => { advanceGameLevel(); this.scene.start('GameScene', { levelIndex: gameState.currentLevel }); } },
        { label: 'MENU', onClick: () => this.scene.start('MenuScene'), color: 'rgba(69,90,100,0.9)' },
      );
    } else if (isGameOver) {
      actions.push(
        { label: 'TRY AGAIN', onClick: () => this.scene.start('GameScene', { levelIndex: this.resultsData.levelIndex }) },
        { label: 'MENU', onClick: () => this.scene.start('MenuScene'), color: 'rgba(69,90,100,0.9)' },
      );
    } else {
      if (this.resultsData.stats && this.resultsData.stats.totalCoralSlots > 0 && !this.resultsData.fromCoral) {
        actions.push({
          label: 'RESTORE REEF',
          onClick: () => this.scene.start('CoralMiniGame', { levelIndex: this.resultsData.levelIndex }),
        });
      }
      if (isLastLevel(this.resultsData.levelIndex)) {
        actions.push({ label: 'PLAY AGAIN', onClick: () => this.scene.start('MenuScene'), color: 'rgba(69,90,100,0.9)' });
      } else {
        actions.push({
          label: 'NEXT LEVEL',
          onClick: () => { advanceGameLevel(); this.scene.start('GameScene', { levelIndex: gameState.currentLevel }); },
        });
      }
      actions.push({ label: 'MENU', onClick: () => this.scene.start('MenuScene'), color: 'rgba(69,90,100,0.9)' });
    }

    // Science Lab is always available
    actions.push({ label: 'SCIENCE LAB', onClick: () => this.scene.start('ShopScene'), color: 'rgba(123,31,162,0.9)' });

    const bw = 150;
    const gap = 12;
    const totalW = actions.length * bw + (actions.length - 1) * gap;
    const startX = width / 2 - totalW / 2 + bw / 2;
    const y = height - 18;

    actions.forEach((action, i) => {
      const x = startX + i * (bw + gap);
      const color = action.color || 'rgba(38,166,154,0.9)';
      const btn = this.add.text(x, y, action.label, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: color,
        padding: { x: 6, y: 9 },
        fixedWidth: bw,
        align: 'center',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setBackgroundColor('rgba(0,150,136,1)'));
      btn.on('pointerout', () => btn.setBackgroundColor(color));
      btn.on('pointerdown', action.onClick);
    });
  }
}