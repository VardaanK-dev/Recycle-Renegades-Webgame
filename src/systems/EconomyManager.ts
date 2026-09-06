import { gameState, saveGameState } from './GameState';
import { getShopItem } from '../config/gameData';
import { ShopItemId } from '../types';

export const CHEAT_UNLOCKALL_COMMAND = '/unlockall';

export function addResearchPoints(amount: number): void {
  gameState.researchPoints = Math.max(0, gameState.researchPoints + Math.round(amount));
  saveGameState();
}

export function canAfford(cost: number): boolean {
  return gameState.researchPoints >= cost;
}

export function hasUpgrade(id: string): boolean {
  return gameState.ownedUpgrades.includes(id);
}

export function getConsumableCount(id: string): number {
  return gameState.consumables[id] ?? 0;
}

export function buyShopItem(id: ShopItemId): boolean {
  const item = getShopItem(id);
  if (!item) return false;
  if (gameState.researchPoints < item.cost) return false;
  if (item.kind === 'permanent') {
    if (gameState.ownedUpgrades.includes(id)) return false;
    gameState.ownedUpgrades.push(id);
  } else {
    gameState.consumables[id] = (gameState.consumables[id] ?? 0) + 1;
  }
  gameState.researchPoints -= item.cost;
  saveGameState();
  return true;
}

export function useConsumable(id: ShopItemId): boolean {
  if ((gameState.consumables[id] ?? 0) <= 0) return false;
  gameState.consumables[id]--;
  saveGameState();
  return true;
}

export interface PlayerBonuses {
  magnetBonus: number;
  speedBonus: number;
  plasticPointBonus: number;
}

export function getPlayerBonuses(): PlayerBonuses {
  let magnetBonus = 0;
  let speedBonus = 0;
  let plasticPointBonus = 0;
  if (gameState.ownedUpgrades.includes('net_upgrade')) {
    magnetBonus = 25;
    plasticPointBonus = 15;
  }
  if (gameState.ownedUpgrades.includes('swim_fins')) {
    speedBonus = 12;
  }
  return { magnetBonus, speedBonus, plasticPointBonus };
}

export function unlockAllCheat(): void {
  gameState.cheatMode = true;
  gameState.levelsCompleted = [...Array.from({ length: 4 }, (_, i) => i)];
  gameState.researchPoints = Math.max(gameState.researchPoints, 5000);
  saveGameState();
}

export function isLevelUnlocked(levelIndex: number): boolean {
  if (gameState.cheatMode) return true;
  if (levelIndex === 0) return true;
  return gameState.levelsCompleted.includes(levelIndex - 1);
}