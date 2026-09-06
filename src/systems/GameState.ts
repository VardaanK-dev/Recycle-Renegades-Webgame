import Phaser from 'phaser';
import { LEVELS } from '../config/gameConfig';
import { calculateOceanCleaned } from '../utils/math';
import { GameState } from '../types';

const GAME_STATE_KEY = 'recycle_renegades_state';

export const gameState: GameState = {
  currentLevel: 0,
  totalScore: 0,
  highScore: 0,
  levelsCompleted: [],
  unlockedPowerUps: [],
  researchPoints: 0,
  ownedUpgrades: [],
  consumables: {},
  cheatMode: false,
};

export function loadGameState(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<GameState>;
      if (saved) {
        gameState.currentLevel = saved.currentLevel ?? 0;
        gameState.totalScore = saved.totalScore ?? 0;
        gameState.highScore = saved.highScore ?? 0;
        gameState.levelsCompleted = saved.levelsCompleted ?? [];
        gameState.unlockedPowerUps = saved.unlockedPowerUps ?? [];
        gameState.researchPoints = saved.researchPoints ?? 0;
        gameState.ownedUpgrades = saved.ownedUpgrades ?? [];
        gameState.consumables = saved.consumables ?? {};
        gameState.cheatMode = saved.cheatMode ?? false;
      }
    }
  } catch {
    // ignore corrupt state
  }
}

export function saveGameState(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
  } catch {
    // ignore write failures
  }
}

export function resetGameState(): void {
  gameState.currentLevel = 0;
  gameState.totalScore = 0;
  gameState.highScore = 0;
  gameState.levelsCompleted = [];
  gameState.unlockedPowerUps = [];
  gameState.researchPoints = 0;
  gameState.ownedUpgrades = [];
  gameState.consumables = {};
  gameState.cheatMode = false;
  saveGameState();
}

export function getLevelConfig(levelIndex: number) {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, levelIndex))];
}

export function advanceGameLevel(): void {
  gameState.currentLevel = Math.min(LEVELS.length - 1, gameState.currentLevel + 1);
  saveGameState();
}

export function isLastLevel(levelIndex: number): boolean {
  return levelIndex >= LEVELS.length - 1;
}
