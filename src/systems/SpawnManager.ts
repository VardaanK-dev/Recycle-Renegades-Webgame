import Phaser from 'phaser';
import { LEVELS } from '../config/gameConfig';
import { PlasticItem } from '../entities/PlasticItem';
import { MarineLife } from '../entities/MarineLife';
import { PowerUp } from '../entities/PowerUp';
import { Jellyfish } from '../entities/Jellyfish';
import { PowerUpType } from '../types';

export class SpawnManager {
  private scene: Phaser.Scene;
  private levelIndex: number;
  private plasticGroup!: Phaser.Physics.Arcade.Group;
  private marineGroup!: Phaser.Physics.Arcade.Group;
  private powerUpGroup!: Phaser.Physics.Arcade.Group;
  private hazardGroup!: Phaser.Physics.Arcade.Group;

  private nextSpawnPlastic: number = 0;
  private nextSpawnMarine: number = 0;
  private nextSpawnPowerUp: number = 0;
  private nextSpawnHazard: number = 0;
  private elapsed: number = 0;

  constructor(scene: Phaser.Scene, levelIndex: number) {
    this.scene = scene;
    this.levelIndex = levelIndex;
    this.createGroups();
  }

  private createGroups(): void {
    this.plasticGroup = this.scene.physics.add.group();
    this.marineGroup = this.scene.physics.add.group();
    this.powerUpGroup = this.scene.physics.add.group();
    this.hazardGroup = this.scene.physics.add.group();
  }

  get plastics(): Phaser.Physics.Arcade.Group {
    return this.plasticGroup;
  }

  get marines(): Phaser.Physics.Arcade.Group {
    return this.marineGroup;
  }

  get powerups(): Phaser.Physics.Arcade.Group {
    return this.powerUpGroup;
  }

  get hazards(): Phaser.Physics.Arcade.Group {
    return this.hazardGroup;
  }

  update(time: number, player: Phaser.GameObjects.GameObject): void {
    const level = LEVELS[this.levelIndex];
    const cfg = level;
    this.elapsed += 16;

    if (this.plasticGroup.countActive(true) < cfg.maxPlastic && time >= this.nextSpawnPlastic) {
      this.spawnPlastic(player);
      this.nextSpawnPlastic = time + cfg.spawnInterval;
    }

    if (this.marineGroup.countActive(true) < cfg.maxMarineLife && time >= this.nextSpawnMarine) {
      this.spawnMarine(player);
      this.nextSpawnMarine = time + cfg.spawnInterval * 2;
    }

    if (cfg.unlockedPowerUps.length > 0 && time >= this.nextSpawnPowerUp && this.elapsed > 15000) {
      const count = Phaser.Math.Between(1, 3);
      for (let i = 0; i < count; i++) {
        this.spawnPowerUp(cfg.unlockedPowerUps);
      }
      this.nextSpawnPowerUp = time + 20000;
    }

    // Hazards appear from level 2 onward (level index >= 1)
    if (this.levelIndex >= 1 && this.hazardGroup.countActive(true) < 4 && time >= this.nextSpawnHazard && this.elapsed > 20000) {
      this.spawnHazard(player);
      this.nextSpawnHazard = time + 16000;
    }
  }

  private spawnPosition(player: Phaser.GameObjects.GameObject): { x: number; y: number } {
    const cam = this.scene.cameras.main;
    const level = LEVELS[this.levelIndex];
    const camera = cam;
    const camW = camera.width;
    const camH = camera.height;
    const camX = camera.scrollX;
    const camY = camera.scrollY;

    let x: number, y: number;
    const edge = Math.random() > 0.5 ? 1 : -1;
    x = camX + camW / 2 + edge * (camW * 0.6 + Math.random() * 100);
    x = Math.max(50, Math.min(level.worldWidth - 50, x));
    y = camY + camH * (0.2 + Math.random() * 0.5);
    y = Math.max(50, Math.min(level.worldHeight - 50, y));

    return { x, y };
  }

  private spawnPlastic(player: Phaser.GameObjects.GameObject): void {
    const pos = this.spawnPosition(player);
    const item = new PlasticItem(this.scene, pos.x, pos.y, PlasticItem.randomType());
    this.plasticGroup.add(item);
  }

  private spawnMarine(player: Phaser.GameObjects.GameObject): void {
    const pos = this.spawnPosition(player);
    const types: ('fish' | 'turtle' | 'school')[] = ['fish', 'fish', 'turtle', 'school'];
    const type = types[Math.floor(Math.random() * types.length)];
    const marine = new MarineLife(this.scene, pos.x, pos.y, type);
    this.marineGroup.add(marine);
  }

  private spawnPowerUp(unlocked: PowerUpType[]): void {
    if (unlocked.length === 0) return;
    const type = unlocked[Math.floor(Math.random() * unlocked.length)];
    const cam = this.scene.cameras.main;
    const level = LEVELS[this.levelIndex];
    const x = Phaser.Math.Between(100, level.worldWidth - 100);
    const y = Phaser.Math.Between(100, level.worldHeight - 100);
    const powerUp = new PowerUp(this.scene, x, y, type);
    this.powerUpGroup.add(powerUp);
  }

  private spawnHazard(player: Phaser.GameObjects.GameObject): void {
    const pos = this.spawnPosition(player);
    const jellyfish = new Jellyfish(this.scene, pos.x, pos.y);
    this.hazardGroup.add(jellyfish);
  }

  resetSpawnTimers(time: number): void {
    this.nextSpawnPlastic = time + 1000;
    this.nextSpawnMarine = time + 1500;
    this.nextSpawnPowerUp = time + 10000;
    this.nextSpawnHazard = time + 20000;
  }
}
