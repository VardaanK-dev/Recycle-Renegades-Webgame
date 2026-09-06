import { LevelStats, PlasticType } from '../types';

export function calculateOceanCleaned(collected: number, total: number): number {
  if (total === 0) return 100;
  return Math.min(100, Math.round((collected / total) * 100));
}

export function calculateReefRestored(planted: number, slots: number): number {
  if (slots === 0) return 100;
  return Math.min(100, Math.round((planted / slots) * 100));
}

export function calculateLevelScore(stats: LevelStats): number {
  const cleanBonus = calculateOceanCleaned(stats.plasticCollected, stats.totalPlastic) * 10;
  const reefBonus = calculateReefRestored(stats.coralPlanted, stats.totalCoralSlots) * 15;
  const rescueBonus = stats.marineRescued * 50;
  return stats.score + cleanBonus + reefBonus + rescueBonus;
}

export function calculateComboMultiplier(consecutiveItems: number, timeWindowMs: number): number {
  if (consecutiveItems < 3) return 1;
  if (timeWindowMs < 5000) return 2;
  if (timeWindowMs < 10000) return 1.5;
  return 1.2;
}

export function getImpactComparison(kgCleaned: number): string {
  if (kgCleaned < 1) return 'That is about ' + Math.round(kgCleaned * 1000) + ' grams of plastic!';
  if (kgCleaned < 10) return 'That is about ' + Math.round(kgCleaned * 40) + ' plastic bottles worth!';
  if (kgCleaned < 100) return 'That is enough to fill ' + Math.round(kgCleaned / 2) + ' trash bags!';
  return 'Amazing! That is ' + Math.round(kgCleaned / 4.5) + ' beach cleanups worth!';
}

export function plasticTypeToEstimateKg(type: PlasticType, count: number): number {
  const weights: Record<PlasticType, number> = {
    bottle: 0.025,
    bag: 0.005,
    straw: 0.001,
    net: 0.5,
    cup: 0.01,
  };
  return (weights[type] || 0.01) * count;
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
