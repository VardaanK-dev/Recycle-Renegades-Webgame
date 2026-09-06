import Phaser from 'phaser';
import { getMarineDef } from '../config/gameData';
import { MarineType } from '../types';

export class MarineLife extends Phaser.Physics.Arcade.Sprite {
  type: MarineType;
  points: number;
  rescueTime: number;
  isTrapped: boolean = true;
  rescued: boolean = false;
  touchStartTime: number = 0;
  private idleOffset = Math.random() * Math.PI * 2;
  private swimSpeed: number = 20 + Math.random() * 30;

  constructor(scene: Phaser.Scene, x: number, y: number, type: MarineType) {
    const def = getMarineDef(type);
    const textureKey = type === 'fish' ? 'fish_trapped' : type === 'turtle' ? 'turtle_trapped' : 'school';
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.type = type;
    this.points = def.points;
    this.rescueTime = def.rescueTime;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setAllowGravity(false);
    this.setDepth(20);
    this.setScale(type === 'turtle' ? 1.5 : 1.2);

    if (type !== 'turtle') {
      body.setVelocity(this.swimSpeed, Math.sin(this.idleOffset) * this.swimSpeed * 0.5);
    }
  }

  update(time: number): void {
    if (!this.active) return;
    if (this.rescued) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.setVelocity(this.swimSpeed * 2, Math.sin(time / 500 + this.idleOffset) * 20);
      }
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.type === 'turtle' && this.touchStartTime > 0) {
      // Turtle shakes as it's being freed
      this.setX(this.x + (Math.random() - 0.5) * 4);
      this.setY(this.y + (Math.random() - 0.5) * 4);
      if (time - this.touchStartTime >= this.rescueTime) {
        this.free();
      }
    } else if (this.type !== 'turtle' && body) {
      // Constrain movement to swim around
      const vx = body.velocity.x;
      const vy = body.velocity.y;
      if (this.y < 100 || this.y > 500) body.setVelocityY(-vy);
      if (this.x < 50 || this.x > this.scene.scale.width + 50) body.setVelocityX(-vx);
    }

    if (this.type === 'fish' || this.type === 'school') {
      const b = this.body as Phaser.Physics.Arcade.Body;
      if (b) this.setFlipX(b.velocity.x < 0);
    }
  }

  startRescue(time: number): void {
    if (this.rescued || this.type === 'turtle') {
      if (this.type === 'turtle' && !this.rescued) {
        if (this.touchStartTime === 0) this.touchStartTime = time;
      }
    }
  }

  free(): void {
    if (this.rescued) return;
    this.rescued = true;
    this.isTrapped = false;
    const textureKey = this.type === 'fish' ? 'fish_free' : this.type === 'turtle' ? 'turtle_free' : 'school';
    this.setTexture(textureKey);
    this.setTint(0xffffff);
    this.scene.tweens.add({
      targets: this,
      scale: this.type === 'turtle' ? 1.6 : 1.3,
      duration: 300,
    });
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 600,
      delay: 1800,
      onComplete: () => {
        if (this.active) this.destroy();
      },
    });
  }
}
