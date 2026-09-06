import Phaser from 'phaser';
import { POWER_UP_DEFS } from '../config/gameData';
import { PowerUpType } from '../types';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  powerUpType: PowerUpType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    super(scene, x, y, type);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.powerUpType = type;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCollideWorldBounds(true);
    this.setDepth(25);
    this.setScale(1.3);

    scene.tweens.add({
      targets: this,
      scale: 1.4,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  static randomUnlocked(unlocked: PowerUpType[]): PowerUpType | null {
    if (unlocked.length === 0) return null;
    return unlocked[Math.floor(Math.random() * unlocked.length)];
  }
}
