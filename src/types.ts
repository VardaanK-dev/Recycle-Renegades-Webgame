export type PlasticType = 'bottle' | 'bag' | 'straw' | 'net' | 'cup';

export interface PlasticDef {
  type: PlasticType;
  label: string;
  short: string;
  points: number;
  color: string;
  fact: string;
}

export type MarineType = 'fish' | 'turtle' | 'school';

export interface MarineDef {
  type: MarineType;
  label: string;
  points: number;
  rescueTime: number;
}

export type CoralType = 'branching' | 'brain' | 'fire';

export interface CoralDef {
  type: CoralType;
  label: string;
  color: string;
  points: number;
}

export type PowerUpType = 'recycling_bin' | 'reef_seed' | 'tethered_cap' | 'current_shield' | 'community_alert';

export interface PowerUpDef {
  type: PowerUpType;
  label: string;
  description: string;
  effect: string;
  color: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  worldWidth: number;
  worldHeight: number;
  targetCleanPercent: number;
  spawnInterval: number;
  maxPlastic: number;
  maxMarineLife: number;
  coralSlots: number;
  bgColor: string;
  unlockedPowerUps: PowerUpType[];
  requiredScore: number;
}

export interface GameState {
  currentLevel: number;
  totalScore: number;
  highScore: number;
  levelsCompleted: number[];
  unlockedPowerUps: PowerUpType[];
  researchPoints: number;
  ownedUpgrades: string[];
  consumables: Record<string, number>;
  cheatMode: boolean;
}

export interface ActiveToolEffect {
  kind: 'seabin' | 'trash_wheel' | 'drone_survey';
  until: number;
  x?: number;
  y?: number;
}

export interface LevelStats {
  plasticCollected: number;
  plasticByType: Record<PlasticType, number>;
  marineRescued: number;
  coralPlanted: number;
  totalPlastic: number;
  totalMarineLife: number;
  totalCoralSlots: number;
  score: number;
  timeElapsed: number;
}

export type ShopItemKind = 'permanent' | 'consumable';

export type ShopItemId =
  | 'net_upgrade'
  | 'swim_fins'
  | 'seabin'
  | 'bubble_barrier'
  | 'trash_wheel'
  | 'coral_nursery'
  | 'drone_survey';

export interface ShopItem {
  id: ShopItemId;
  name: string;
  cost: number;
  kind: ShopItemKind;
  description: string;
  fact: string;
  iconKey: string;
  category: string;
}
