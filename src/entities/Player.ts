import Phaser from 'phaser';
import { InputManager } from '../systems/InputManager';
import { lerp } from '../utils/math';
import {
  PLAYER_MAX_LIVES,
  PLAYER_INVULNERABLE_TIME,
  PLAYER_DASH_SPEED,
  PLAYER_DASH_DURATION,
  PLAYER_DASH_COOLDOWN,
} from '../config/gameConfig';

export class Player extends Phaser.Physics.Arcade.Sprite {
  inputManager: InputManager;
  lives: number = PLAYER_MAX_LIVES;
  private invulnerableUntil: number = 0;
  private dashUntil: number = 0;
  dashReadyAt: number = 0;
  private lastFacing: 'up' | 'down' | 'left' | 'right' = 'right';
  isDashing: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, input: InputManager) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.inputManager = input;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(28, 28);
    body.setOffset(2, 2);
    this.setDepth(50);
    this.setScale(1.2);
  }

  update(time: number, baseSpeed: number, delta: number): void {
    const dir = this.inputManager.getDirection(true);

    const effectiveSpeed = this.isDashing ? PLAYER_DASH_SPEED : baseSpeed;
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Smooth acceleration toward the target velocity for nicer swim feel
    const targetVx = dir.x * effectiveSpeed;
    const targetVy = dir.y * effectiveSpeed;
    const k = 1 - Math.exp(-delta / 90);
    body.setVelocity(lerp(body.velocity.x, targetVx, k), lerp(body.velocity.y, targetVy, k));

    if (time > this.dashUntil) {
      this.isDashing = false;
    }

    this.updateFacing(dir);
  }

  private updateFacing(dir: { x: number; y: number }): void {
    if (Math.abs(dir.x) > Math.abs(dir.y)) {
      this.lastFacing = dir.x > 0 ? 'right' : 'left';
    } else if (Math.abs(dir.y) > 0.1) {
      this.lastFacing = dir.y > 0 ? 'down' : 'up';
    }
    if (dir.x < 0) this.setFlipX(true);
    else if (dir.x > 0) this.setFlipX(false);
  }

  tryDash(time: number): boolean {
    if (time >= this.dashReadyAt) {
      this.dashReadyAt = time + PLAYER_DASH_COOLDOWN;
      this.dashUntil = time + PLAYER_DASH_DURATION;
      this.isDashing = true;
      return true;
    }
    return false;
  }

  hurt(time: number): boolean {
    if (time < this.invulnerableUntil) return false;
    this.invulnerableUntil = time + PLAYER_INVULNERABLE_TIME;
    this.lives--;
    this.setAlpha(0.5);
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.5, to: 1 },
      duration: PLAYER_INVULNERABLE_TIME,
      onComplete: () => this.setAlpha(1),
    });
    return true;
  }

  gainLife(): void {
    if (this.lives < PLAYER_MAX_LIVES) this.lives++;
  }

  get isInvulnerable(): boolean {
    return this.scene.time.now < this.invulnerableUntil;
  }
}
