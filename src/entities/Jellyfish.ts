import Phaser from 'phaser';

export class Jellyfish extends Phaser.Physics.Arcade.Sprite {
  private driftAngle: number;
  private driftSpeed: number;
  private bobPhase: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'jellyfish');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(7, 4, 5);
    body.setCollideWorldBounds(true);
    this.setDepth(45);
    this.setScale(1.6);

    this.driftAngle = Math.random() * Math.PI * 2;
    this.driftSpeed = 15 + Math.random() * 20;
    this.bobPhase = Math.random() * Math.PI * 2;
  }

  update(time: number): void {
    // Slow, erratic drift like a real drifting jellyfish
    this.driftAngle += (Math.random() - 0.5) * 0.15;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const vx = Math.cos(this.driftAngle) * this.driftSpeed;
    const vy = Math.sin(this.driftAngle * 0.6) * (this.driftSpeed * 0.6) + Math.sin(time * 0.002 + this.bobPhase) * 8;
    body.setVelocity(vx, vy);

    // Gentle pulsing scale so players can see the "sting" bell
    const pulse = 1.55 + Math.sin(time * 0.004 + this.bobPhase) * 0.12;
    this.setScale(pulse);
  }

  hurtPlayer(time: number, player: { hurt: (t: number) => boolean }): boolean {
    return player.hurt(time);
  }
}