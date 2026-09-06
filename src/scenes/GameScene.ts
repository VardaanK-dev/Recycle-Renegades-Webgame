import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Jellyfish } from '../entities/Jellyfish';
import { InputManager } from '../systems/InputManager';
import { TouchControls } from '../ui/TouchControls';
import { ConsumableBar } from '../ui/ConsumableBar';
import { SpawnManager } from '../systems/SpawnManager';
import { ParallaxBg } from '../systems/ParallaxBg';
import { ScoreManager } from '../systems/ScoreManager';
import { HUD } from '../ui/HUD';
import { PlasticItem } from '../entities/PlasticItem';
import { MarineLife } from '../entities/MarineLife';
import { PowerUp } from '../entities/PowerUp';
import { RevealMarkers } from '../ui/RevealMarkers';
import { LEVELS, PLAYER_SPEED } from '../config/gameConfig';
import { getPlasticDef, POWER_UP_DEFS, getShopItem } from '../config/gameData';
import { calculateOceanCleaned, calculateReefRestored, calculateComboMultiplier } from '../utils/math';
import { gameState, saveGameState, getLevelConfig } from '../systems/GameState';
import {
  addResearchPoints,
  getPlayerBonuses,
  useConsumable,
} from '../systems/EconomyManager';
import { ActiveToolEffect, PlasticType, PowerUpType, ShopItemId } from '../types';

interface ActivePowerUp {
  type: PowerUpType;
  until: number;
}

export class GameScene extends Phaser.Scene {
  private levelIndex = 0;
  private player!: Player;
  private inputManager!: InputManager;
  private touchControls!: TouchControls;
  private consoleToolbar!: ConsumableBar;
  private spawner!: SpawnManager;
  private bg!: ParallaxBg;
  private scoreMgr!: ScoreManager;
  private hud!: HUD;
  private activePowerUps: ActivePowerUp[] = [];
  private activeTools: ActiveToolEffect[] = [];
  private tetheredZones: { x: number; y: number; until: number }[] = [];
  private currentHint: Phaser.GameObjects.Text | null = null;
  private startTime = 0;
  private levelEnded = false;
  private totalPlasticEstimate = 0;
  private currentSpeed = PLAYER_SPEED;
  private magnetBonus = 0;
  private speedBonusPercent = 0;
  private menuBtn!: Phaser.GameObjects.Text;
  private revealMarkers!: RevealMarkers;

  constructor() {
    super('GameScene');
  }

  init(data: { levelIndex: number }): void {
    this.levelIndex = data && data.levelIndex >= 0 ? data.levelIndex : gameState.currentLevel;
    gameState.currentLevel = this.levelIndex;
  }

  create(): void {
    const level = getLevelConfig(this.levelIndex);
    this.levelEnded = false;
    this.activePowerUps = [];
    this.activeTools = [];
    this.tetheredZones = [];
    const bonuses = getPlayerBonuses();
    this.magnetBonus = bonuses.magnetBonus;
    this.speedBonusPercent = bonuses.speedBonus;
    this.currentSpeed = PLAYER_SPEED * (1 + this.speedBonusPercent / 100);

    this.physics.world.setBounds(0, 0, level.worldWidth, level.worldHeight);
    this.cameras.main.setBounds(0, 0, level.worldWidth, level.worldHeight);
    this.cameras.main.setBackgroundColor(level.bgColor);

    this.bg = new ParallaxBg(this, level.bgColor);
    this.inputManager = new InputManager(this);
    this.touchControls = new TouchControls(this, this.inputManager);
    this.touchControls.show();

    const startX = 100;
    const startY = level.worldHeight * 0.6;
    this.player = new Player(this, startX, startY, this.inputManager);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    const estimatedTotal = this.estimateTotalPlastic(level.maxPlastic);
    this.scoreMgr = new ScoreManager(this, estimatedTotal, level.maxMarineLife * 2, level.coralSlots || 0);
    this.totalPlasticEstimate = estimatedTotal;

    this.hud = new HUD(this, this.player);
    this.hud.updateLives(this.player.lives);
    this.hud.updateScore(0);
    this.hud.updateResearchPoints(gameState.researchPoints);
    this.hud.updateOceanCleaned(0, estimatedTotal);
    this.hud.updateRescued(0);
    this.hud.updateDash(this.time.now);

    this.consoleToolbar = new ConsumableBar(this, (id) => this.useTool(id));
    this.consoleToolbar.refresh();

    this.spawner = new SpawnManager(this, this.levelIndex);
    this.spawner.resetSpawnTimers(this.time.now);

    this.revealMarkers = new RevealMarkers(this);

    this.setupColliders();
    this.setupIntroMessage(level);
    this.setupKeyboard();
    this.setupMenuButton();
    this.setupDesktopHint();
    this.scale.on('resize', this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
    });
    this.startTime = this.time.now;
  }

  private setupMenuButton(): void {
    this.menuBtn = this.add.text(12, 76, 'MENU', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: 'rgba(13,27,42,0.8)',
      padding: { x: 10, y: 6 },
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1101).setInteractive({ useHandCursor: true });
    this.menuBtn.on('pointerover', () => this.menuBtn.setBackgroundColor('rgba(38,166,154,0.9)'));
    this.menuBtn.on('pointerout', () => this.menuBtn.setBackgroundColor('rgba(13,27,42,0.8)'));
    this.menuBtn.on('pointerdown', () => {
      if (this.levelEnded) return;
      this.scene.start('MenuScene');
    });
  }

  private setupDesktopHint(): void {
    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (this.game.device.input.touch as unknown as boolean);
    if (isTouch) return;
    const hint = this.add.text(this.scale.width / 2, this.scale.height - 116, 'WASD / arrows = move   ·   SPACE = dash + rescue   ·   1-5 = tools', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#b3e5fc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1099);
    this.tweens.add({
      targets: hint,
      alpha: 0,
      delay: 8000,
      duration: 1000,
      onComplete: () => hint.destroy(),
    });
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.bg.resize(gameSize.width, gameSize.height);
  }

  private setupKeyboard(): void {
    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey?.on('down', () => {
      this.player.tryDash(this.time.now);
    });

    const digitKeys = [
      Phaser.Input.Keyboard.KeyCodes.ONE,
      Phaser.Input.Keyboard.KeyCodes.TWO,
      Phaser.Input.Keyboard.KeyCodes.THREE,
      Phaser.Input.Keyboard.KeyCodes.FOUR,
      Phaser.Input.Keyboard.KeyCodes.FIVE,
    ];
    digitKeys.forEach((code, i) => {
      this.input.keyboard?.addKey(code)?.on('down', () => this.consoleToolbar.handleKey(i));
    });
  }

  private estimateTotalPlastic(maxPlastic: number): number {
    return Math.round(maxPlastic * 1.8);
  }

  private setupIntroMessage(level: (typeof LEVELS)[number]): void {
    const cx = this.scale.width / 2;
    const msg = this.add.text(cx, this.scale.height / 2 - 100, level.name, {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1100);
    const sub = this.add.text(cx, this.scale.height / 2 - 60, level.description, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#b3e5fc',
      align: 'center',
      wordWrap: { width: Math.min(this.scale.width - 120, 500) },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1100);
    this.tweens.add({
      targets: [msg, sub],
      alpha: 0,
      duration: 800,
      delay: 3500,
      onComplete: () => { msg.destroy(); sub.destroy(); },
    });
  }

  private setupColliders(): void {
    this.physics.add.overlap(
      this.player,
      this.spawner.plastics,
      (a, b) => this.onPlasticOverlap(a as Phaser.GameObjects.GameObject, b as Phaser.GameObjects.GameObject),
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.spawner.marines,
      (a, b) => this.onMarineOverlap(a as Phaser.GameObjects.GameObject, b as Phaser.GameObjects.GameObject),
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.spawner.powerups,
      (a, b) => this.onPowerUpOverlap(a as Phaser.GameObjects.GameObject, b as Phaser.GameObjects.GameObject),
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.spawner.hazards,
      (a, b) => this.onHazardOverlap(b as Phaser.GameObjects.GameObject),
      undefined,
      this
    );
  }

  private onHazardOverlap(hazardObj: Phaser.GameObjects.GameObject): void {
    if (!hazardObj.active || this.player.isInvulnerable) return;
    const hurt = this.player.hurt(this.time.now);
    if (hurt) {
      this.sound.play('sfx_hurt');
      this.cameras.main.shake(180, 0.008);
      this.hud.updateLives(this.player.lives);
      this.showCollectionFeedback(this.player.x, this.player.y - 26, 'JELLYFISH STING!');
      if (this.player.lives <= 0) {
        this.gameOver();
      }
    }
  }

  private onPlasticOverlap(
    playerObj: Phaser.GameObjects.GameObject,
    plasticObj: Phaser.GameObjects.GameObject
  ): void {
    const plastic = plasticObj as PlasticItem;
    if (!plastic.active) return;
    this.collectPlastic(plastic);
  }

  private collectPlastic(plastic: PlasticItem): void {
    if (!plastic.active) return;
    let gained = this.scoreMgr.addPlastic(plastic.type, plastic.points, this.time.now);
    if (this.isToolActive('trash_wheel')) {
      gained *= 2;
      this.scoreMgr.addBonus(gained / 2);
    }
    addResearchPoints(gained);
    this.hud.updateScore(this.scoreMgr.score);
    this.hud.updateResearchPoints(gameState.researchPoints);
    this.hud.updateOceanCleaned(this.scoreMgr.stats.plasticCollected, this.totalPlasticEstimate);
    this.sound.play('sfx_collect');
    this.showCollectionFeedback(plastic.x, plastic.y, `+${gained}`);
    if (Math.random() < 0.25) {
      this.showFact(plastic.type);
    }
    plastic.destroy();
    this.checkLevelComplete();
  }

  private isToolActive(kind: ActiveToolEffect['kind']): boolean {
    return this.activeTools.some((t) => t.kind === kind && t.until > this.time.now);
  }

  private onMarineOverlap(
    playerObj: Phaser.GameObjects.GameObject,
    marineObj: Phaser.GameObjects.GameObject
  ): void {
    const marine = marineObj as MarineLife;
    if (!marine.active || marine.rescued) return;
    if (marine.type === 'turtle') {
      marine.startRescue(this.time.now);
      this.currentHint?.destroy();
      this.currentHint = this.add.text(marine.x, marine.y - 30, 'HOLD to free!', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffe082',
      }).setOrigin(0.5).setDepth(200);
      this.time.delayedCall(1000, () => { if (this.currentHint) this.currentHint.destroy(); });
      if (this.time.now - marine.touchStartTime >= marine.rescueTime) {
        this.rescueMarine(marine);
      }
    } else if (Math.random() < 0.12) {
      this.rescueMarine(marine);
    }
    this.checkLevelComplete();
  }

  private rescueMarine(marine: MarineLife): void {
    if (marine.rescued) return;
    this.scoreMgr.addMarineLife(marine.points);
    addResearchPoints(marine.points);
    this.hud.updateScore(this.scoreMgr.score);
    this.hud.updateResearchPoints(gameState.researchPoints);
    this.hud.updateRescued(this.scoreMgr.stats.marineRescued);
    this.sound.play('sfx_rescue');
    this.showCollectionFeedback(marine.x, marine.y, `+${marine.points} RESCUED!`);
    marine.free();
  }

  private onPowerUpOverlap(
    playerObj: Phaser.GameObjects.GameObject,
    powerObj: Phaser.GameObjects.GameObject
  ): void {
    const power = powerObj as PowerUp;
    if (!power.active) return;
    this.activatePowerUp(power.powerUpType);
    const def = POWER_UP_DEFS.find((d) => d.type === power.powerUpType);
    if (def) this.showCollectionFeedback(power.x, power.y, def.label.toUpperCase());
    power.destroy();
  }

  private activatePowerUp(type: PowerUpType): void {
    const until = this.time.now + 10000;
    this.activePowerUps = this.activePowerUps.filter((p) => p.type !== type);
    this.activePowerUps.push({ type, until });

    const def = POWER_UP_DEFS.find((d) => d.type === type);
    this.hud.showMessage(def ? def.effect : '', 2500);

    if (type === 'tethered_cap') {
      this.tetheredZones.push({ x: this.player.x, y: this.player.y, until: this.time.now + 15000 });
    }
    if (type === 'reef_seed') {
      this.scoreMgr.addCoral(200);
      this.hud.updateScore(this.scoreMgr.score);
      addResearchPoints(200);
      this.hud.updateResearchPoints(gameState.researchPoints);
      this.sound.play('sfx_plant');
    }
    if (type === 'community_alert') {
      // Nothing extra needed: reveal markers are driven each frame.
    }
  }

  private updatePowerUpEffects(): void {
    const now = this.time.now;
    this.activePowerUps = this.activePowerUps.filter((p) => p.until > now);
    this.activeTools = this.activeTools.filter((t) => t.until > now);
    this.tetheredZones = this.tetheredZones.filter((z) => z.until > now);

    let speedMult = 1;
    for (const p of this.activePowerUps) {
      if (p.type === 'recycling_bin') {
        this.suckNearbyPlastic(150 + this.magnetBonus, this.player.x, this.player.y);
      }
      if (p.type === 'current_shield') {
        speedMult = 1.5;
      }
      if (p.type === 'tethered_cap') {
        this.suppressPlasticInTetheredZones();
      }
    }
    for (const tool of this.activeTools) {
      if (tool.kind === 'seabin' && tool.x !== undefined && tool.y !== undefined) {
        this.suckNearbyPlastic(260, tool.x, tool.y);
      }
    }
    // Unify reveal sources (Drone Survey tool + Community Alert power-up).
    let revealUntil = 0;
    for (const p of this.activePowerUps) {
      if (p.type === 'community_alert') revealUntil = Math.max(revealUntil, p.until);
    }
    for (const tool of this.activeTools) {
      if (tool.kind === 'drone_survey') revealUntil = Math.max(revealUntil, tool.until);
    }
    if (revealUntil > 0) {
      this.revealMarkers.activate(this.spawner.marines, revealUntil);
    }
    this.revealMarkers.update(now);

    this.currentSpeed = PLAYER_SPEED * speedMult * (1 + this.speedBonusPercent / 100);
  }

  private useTool(id: ShopItemId): void {
    if (this.levelEnded) return;
    if (!useConsumable(id)) {
      this.hud.showMessage('No charges left. Buy more in the science lab after a level.');
      return;
    }
    this.consoleToolbar.refresh();
    this.sound.play('sfx_use');
    const item = getShopItem(id);

    if (id === 'seabin') {
      this.activeTools.push({ kind: 'seabin', until: this.time.now + 8000, x: this.player.x, y: this.player.y });
      this.hud.showMessage('Seabin deployed — sucking plastic nearby!');
    } else if (id === 'trash_wheel') {
      this.activeTools.push({ kind: 'trash_wheel', until: this.time.now + 8000 });
      this.hud.showMessage('Trash Wheel ONLINE — double plastic points!');
    } else if (id === 'drone_survey') {
      this.activeTools.push({ kind: 'drone_survey', until: this.time.now + 15000 });
      this.hud.showMessage('Drone survey launched — marine life revealed!');
    } else if (id === 'bubble_barrier') {
      let cleared = 0;
      for (const child of this.spawner.plastics.getChildren()) {
        if (cleared >= 6 || this.levelEnded) break;
        const itemToCollect = child as PlasticItem;
        if (!itemToCollect.active) continue;
        const dist = Math.hypot(itemToCollect.x - this.player.x, itemToCollect.y - this.player.y);
        if (dist < 380) {
          this.collectPlastic(itemToCollect);
          cleared++;
        }
      }
      this.hud.showMessage(`Bubble barrier pushed ${cleared} plastics into the shore net!`);
    } else if (id === 'coral_nursery') {
      this.registry.set('coralNurseryActive', true);
      this.hud.showMessage('Coral nursery kit ready for the reef restoration minigame!');
    }

    if (item) this.hud.showFact(item.fact, 5000);
  }

  private suckNearbyPlastic(radius: number, cx: number, cy: number): void {
    for (const child of this.spawner.plastics.getChildren()) {
      const item = child as PlasticItem;
      if (!item.active) continue;
      const dist = Math.hypot(item.x - cx, item.y - cy);
      if (dist < radius) {
        const body = item.body as Phaser.Physics.Arcade.Body;
        const pull = (radius - dist) / radius;
        body.setVelocity(
          body.velocity.x + (cx - item.x) * pull * 0.08,
          body.velocity.y + (cy - item.y) * pull * 0.08
        );
      }
    }
  }

  private suppressPlasticInTetheredZones(): void {
    for (const zone of this.tetheredZones) {
      for (const child of this.spawner.plastics.getChildren()) {
        const item = child as PlasticItem;
        const dist = Math.hypot(item.x - zone.x, item.y - zone.y);
        if (dist < 300 && item.active) {
          item.disableBody(true, true);
        }
      }
    }
  }

  private showCollectionFeedback(x: number, y: number, text: string): void {
    const label = this.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffe082',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(500);
    this.tweens.add({
      targets: label,
      y: y - 30,
      alpha: 0,
      duration: 900,
      onComplete: () => label.destroy(),
    });
  }

  private showFact(type: PlasticType): void {
    const def = getPlasticDef(type);
    if (this.currentHint) this.currentHint.destroy();
    this.currentHint = this.add.text(this.scale.width / 2, this.scale.height * 0.24, def.fact, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: 'rgba(10,22,40,0.85)',
      padding: { x: 12, y: 8 },
      wordWrap: { width: 500 },
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1100);
    this.time.delayedCall(3500, () => {
      if (this.currentHint) { this.currentHint.destroy(); this.currentHint = null; }
    });
  }

  private checkLevelComplete(): void {
    if (this.levelEnded) return;
    const level = getLevelConfig(this.levelIndex);
    const oceanCleaned = calculateOceanCleaned(this.scoreMgr.stats.plasticCollected, this.totalPlasticEstimate);

    if (oceanCleaned >= level.targetCleanPercent) {
      this.levelEnded = true;
      this.advanceAfterLevel();
    }
  }

  private advanceAfterLevel(): void {
    this.hud.showMessage('Level complete!', 1500);
    const oceanCleaned = calculateOceanCleaned(this.scoreMgr.stats.plasticCollected, this.totalPlasticEstimate);
    const reefRestored = calculateReefRestored(this.scoreMgr.stats.coralPlanted, this.scoreMgr.stats.totalCoralSlots);

    const stats = { ...this.scoreMgr.stats };
    this.saveLevelCompletion();

    this.cameras.main.fadeOut(900);
    this.time.delayedCall(900, () => {
      this.scene.start('ResultsScene', {
        levelIndex: this.levelIndex,
        oceanCleaned,
        reefRestored,
        stats,
        success: true,
      });
    });
    this.cleanup();
  }

  private saveLevelCompletion(): void {
    if (!gameState.levelsCompleted.includes(this.levelIndex)) {
      gameState.levelsCompleted.push(this.levelIndex);
    }
    const totalScore = gameState.totalScore + this.scoreMgr.score;
    gameState.totalScore = totalScore;
    if (totalScore > gameState.highScore) gameState.highScore = totalScore;
    for (const pu of getLevelConfig(this.levelIndex).unlockedPowerUps) {
      if (!gameState.unlockedPowerUps.includes(pu)) gameState.unlockedPowerUps.push(pu);
    }
    gameState.currentLevel = this.levelIndex;

    // Earn Research Points for completing the level (invest in science solutions)
    const rp = this.scoreMgr.stats.plasticCollected + this.scoreMgr.stats.marineRescued * 2
      + this.scoreMgr.stats.coralPlanted * 3 + 50 + this.levelIndex * 50;
    addResearchPoints(rp);
    saveGameState();
  }

  private gameOver(): void {
    this.levelEnded = true;
    this.cameras.main.fadeOut(800);
    this.time.delayedCall(800, () => {
      this.scene.start('ResultsScene', {
        levelIndex: this.levelIndex,
        oceanCleaned: calculateOceanCleaned(this.scoreMgr.stats.plasticCollected, this.totalPlasticEstimate),
        reefRestored: 0,
        stats: this.scoreMgr.stats,
        success: false,
        gameOver: true,
      });
    });
    this.cleanup();
  }

  private cleanup(): void {
    this.touchControls.hide();
    this.hud.destroy();
    this.consoleToolbar.destroy();
    this.revealMarkers.clear();
  }

  update(time: number, delta: number): void {
    if (this.levelEnded) return;
    this.inputManager.update();
    this.scoreMgr.update(delta);
    this.updatePowerUpEffects();

    this.player.update(time, this.currentSpeed, delta);
    this.spawner.update(time, this.player);
    this.bg.update(this.cameras.main.scrollX);
    this.hud.updateScore(this.scoreMgr.score);
    this.hud.updateResearchPoints(gameState.researchPoints);
    this.hud.updateDash(time);
    this.hud.setPowerUps(this.activePowerUps, time);

    const comboTime = time - this.scoreMgr.comboTimerStart;
    if (this.scoreMgr.comboCount >= 3 && comboTime <= 10000) {
      const mult = calculateComboMultiplier(this.scoreMgr.comboCount, comboTime);
      this.hud.setCombo(mult, this.scoreMgr.comboTimerStart + 10000, time);
    } else {
      this.hud.setCombo(null);
    }

    for (const child of this.spawner.plastics.getChildren()) {
      (child as PlasticItem).update(time);
    }
    for (const child of this.spawner.marines.getChildren()) {
      (child as MarineLife).update(time);
    }
    for (const child of this.spawner.hazards.getChildren()) {
      (child as Jellyfish).update(time);
    }

    if (this.player.lives <= 0) {
      this.gameOver();
    }
  }
}