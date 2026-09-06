import Phaser from 'phaser';
import { LevelStats, PlasticType } from '../types';

export class ScoreManager {
  scene: Phaser.Scene;
  stats: LevelStats;

  private comboCountValue: number = 0;
  private comboTimerStartValue: number = 0;
  private readonly comboWindowMs = 10000;

  constructor(scene: Phaser.Scene, totalPlastic: number, totalMarineLife: number, totalCoralSlots: number) {
    this.scene = scene;
    this.stats = {
      plasticCollected: 0,
      plasticByType: {
        bottle: 0,
        bag: 0,
        straw: 0,
        net: 0,
        cup: 0,
      },
      marineRescued: 0,
      coralPlanted: 0,
      totalPlastic,
      totalMarineLife,
      totalCoralSlots,
      score: 0,
      timeElapsed: 0,
    };
  }

  addPlastic(type: PlasticType, points: number, time: number): number {
    this.stats.plasticCollected++;
    this.stats.plasticByType[type]++;
    this.comboCountValue++;
    if (this.comboCountValue === 1) this.comboTimerStartValue = time;
    const comboActive = time - this.comboTimerStartValue <= this.comboWindowMs;
    const multiplier = comboActive ? this.comboCountValue >= 5 ? 1.5 : 1 : 1;
    const gained = Math.round(points * multiplier);
    this.stats.score += gained;
    return gained;
  }

  addMarineLife(points: number): number {
    this.stats.marineRescued++;
    this.stats.score += points;
    this.comboCountValue = 0;
    return points;
  }

  addBonus(points: number): number {
    this.stats.score += points;
    return points;
  }

  addCoral(points: number): number {
    this.stats.coralPlanted++;
    this.stats.score += points;
    this.comboCountValue = 0;
    return points;
  }

  update(delta: number): void {
    this.stats.timeElapsed += delta;
  }

  get plasticCollected(): number {
    return this.stats.plasticCollected;
  }

  get comboCount(): number {
    return this.comboCountValue;
  }

  get comboTimerStart(): number {
    return this.comboTimerStartValue;
  }

  get score(): number {
    return this.stats.score;
  }
}
