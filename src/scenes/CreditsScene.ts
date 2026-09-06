import Phaser from 'phaser';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.image(0, 0, 'results_bg').setOrigin(0).setDisplaySize(width, height);

    this.add.text(width / 2, 46, 'CREDITS', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#4dd0e1',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(width / 2, 86, 'RECYCLE RENEGADES — a game about saving the reef', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#b3e5fc',
    }).setOrigin(0.5);

    const lines: { text: string; color: string; size: string }[] = [
      { text: 'BUILT WITH', color: '#80cbc4', size: '12px' },
      { text: 'Phaser 3  —  game engine', color: '#ffffff', size: '14px' },
      { text: 'TypeScript  —  typed game code', color: '#e3f2fd', size: '14px' },
      { text: 'Vite  —  fast build & dev server', color: '#e3f2fd', size: '14px' },
      { text: 'opencode  —  AI coding assistant that helped write this project', color: '#ffd54f', size: '14px' },
      { text: 'PowerShell & GitHub Actions  —  tooling and hosting', color: '#e3f2fd', size: '14px' },
      { text: '', color: '#ffffff', size: '14px' },
      { text: 'All pixel art and sound effects are generated procedurally at runtime.', color: '#90caf9', size: '12px' },
      { text: 'No external assets were used.', color: '#90caf9', size: '12px' },
      { text: '', color: '#ffffff', size: '12px' },
      { text: 'Inspired by real ocean cleanup: Seabin, Mr. Trash Wheel,', color: '#90caf9', size: '12px' },
      { text: 'The Ocean Cleanup, The Great Bubble Barrier and coral nurseries.', color: '#90caf9', size: '12px' },
      { text: '', color: '#ffffff', size: '12px' },
      { text: 'Thank you for playing! Every rescue counts.', color: '#a5d6a7', size: '13px' },
    ];

    let y = 128;
    for (const line of lines) {
      this.add.text(width / 2, y, line.text, {
        fontFamily: 'monospace',
        fontSize: line.size,
        color: line.color,
        align: 'center',
      }).setOrigin(0.5);
      y += 20;
    }

    const backBtn = this.add.text(width / 2, height - 30, '< BACK TO MENU', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: 'rgba(38,166,154,0.9)',
      padding: { x: 16, y: 9 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setBackgroundColor('rgba(0,150,136,0.95)'));
    backBtn.on('pointerout', () => backBtn.setBackgroundColor('rgba(38,166,154,0.9)'));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}