import { LevelConfig, PowerUpType } from '../types';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Coal Waters',
    description: 'A sunny coast polluted by river runoff. Collect plastic before it reaches the deep ocean.',
    worldWidth: 2400,
    worldHeight: 600,
    targetCleanPercent: 40,
    spawnInterval: 2000,
    maxPlastic: 25,
    maxMarineLife: 5,
    coralSlots: 0,
    bgColor: '#0e4a6f',
    unlockedPowerUps: [],
    requiredScore: 0,
  },
  {
    id: 2,
    name: 'Open Ocean',
    description: 'Deep waters where marine life struggles with ghost nets and microplastics.',
    worldWidth: 3200,
    worldHeight: 800,
    targetCleanPercent: 55,
    spawnInterval: 1600,
    maxPlastic: 35,
    maxMarineLife: 10,
    coralSlots: 0,
    bgColor: '#0a2e5c',
    unlockedPowerUps: ['recycling_bin', 'current_shield'],
    requiredScore: 500,
  },
  {
    id: 3,
    name: 'Coral Reef',
    description: 'A damaged reef needs your help. Clean pollution and plant new coral to restore the ecosystem.',
    worldWidth: 3600,
    worldHeight: 800,
    targetCleanPercent: 70,
    spawnInterval: 1400,
    maxPlastic: 40,
    maxMarineLife: 12,
    coralSlots: 8,
    bgColor: '#0d3b66',
    unlockedPowerUps: ['reef_seed', 'tethered_cap'],
    requiredScore: 1500,
  },
  {
    id: 4,
    name: 'Deep Sea',
    description: 'The darkest depths hide the worst pollution. Use every tool you have to save the ocean.',
    worldWidth: 4000,
    worldHeight: 1000,
    targetCleanPercent: 80,
    spawnInterval: 1200,
    maxPlastic: 50,
    maxMarineLife: 15,
    coralSlots: 12,
    bgColor: '#051530',
    unlockedPowerUps: ['community_alert'],
    requiredScore: 3000,
  },
];

export const PLAYER_SPEED = 200;
export const PLAYER_DASH_SPEED = 350;
export const PLAYER_DASH_DURATION = 300;
export const PLAYER_DASH_COOLDOWN = 2000;
export const PLAYER_MAX_LIVES = 3;
export const PLAYER_INVULNERABLE_TIME = 1500;

export const COLLECTION_RADIUS = 40;
export const RESCUE_RADIUS = 30;

export const POWER_UP_DURATION = 10000;
export const POWER_UP_SPAWN_CHANCE = 0.15;
