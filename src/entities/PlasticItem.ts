import Phaser from 'phaser';
import { getPlasticDef, PLASTIC_TYPES } from '../config/gameData';
import { PlasticType } from '../types';

export class PlasticItem extends Phaser.Physics.Arcade.Sprite {
  type: PlasticType;
  points: number;
  fact: string;
  private wasCreated: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PlasticType) {
    const def = getPlasticDef(type);
    super(scene, x, y, type);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.type = type;
    this.points = def.points;
    this.fact = def.fact;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(0.5, 0.5);
    body.setSize(20, 20);
    body.setAllowGravity(false);
    this.setDepth(20);

    const maxSpeed = 30 + Math.random() * 40;
    body.setVelocity(
      (Math.random() - 0.5) * 2 * maxSpeed,
      (Math.random() - 0.5) * 2 * maxSpeed
    );
  }

  static randomType(): PlasticType {
    const roll = Math.random();
    if (roll < 0.25) return 'bottle';
    if (roll < 0.45) return 'bag';
    if (roll < 0.6) return 'straw';
    if (roll < 0.75) return 'cup';
    return 'net';
  }

  update(time: number): void {
    if (this.active) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (body && Math.random() < 0.3) {
        body.setVelocity(
          body.velocity.x + (Math.random() - 0.5) * 10,
          body.velocity.y + (Math.random() - 0.5) * 10
        );
      }
      this.rotation = Math.sin(time / 400 + this.x) * 0.15;
    }
  }
}
