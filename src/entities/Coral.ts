import Phaser from 'phaser';
import { CORAL_TYPES } from '../config/gameData';
import { CoralType } from '../types';

export class Coral extends Phaser.GameObjects.Image {
  coralType: CoralType;
  points: number;
  placed: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, type: CoralType) {
    const def = CORAL_TYPES.find((c) => c.type === type) || CORAL_TYPES[0];
    const textureKey = `coral_${type}`;
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    this.coralType = type;
    this.points = def.points;
    this.setDepth(30);
    this.setScale(1.5);
  }

  place(): void {
    this.placed = true;
    this.scene.tweens.add({
      targets: this,
      scale: 1.8,
      duration: 300,
    });
    this.scene.tweens.add({
      targets: this,
      y: this.y - 10,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }
}
