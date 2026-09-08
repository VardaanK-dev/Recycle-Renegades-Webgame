import Phaser from 'phaser';
import { SHOP_ITEMS } from '../config/gameData';
import { gameState } from '../systems/GameState';
import {
  canAfford,
  buyShopItem,
  hasUpgrade,
  getConsumableCount,
} from '../systems/EconomyManager';
import { clamp } from '../utils/math';
import { ShopItem, ShopItemId } from '../types';

interface Card {
  item: ShopItem;
  top: number;
  rect: Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Image;
  name: Phaser.GameObjects.Text;
  category: Phaser.GameObjects.Text;
  desc: Phaser.GameObjects.Text;
  coin: Phaser.GameObjects.Image;
  cost: Phaser.GameObjects.Text;
  count: Phaser.GameObjects.Text;
  buyBtn: Phaser.GameObjects.Text;
}

export class ShopScene extends Phaser.Scene {
  private bg!: Phaser.GameObjects.Image;
  private title!: Phaser.GameObjects.Text;
  private subtitle!: Phaser.GameObjects.Text;
  private backBtn!: Phaser.GameObjects.Text;
  private coin!: Phaser.GameObjects.Image;
  private rpText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private infoText!: Phaser.GameObjects.Text;
  private cards: Card[] = [];
  private cardH = 86;
  private gap = 12;
  private scrollY = 0;
  private minScroll = 0;
  private maxScroll = 0;
  private dragging = false;
  private dragLastY = 0;
  private wheelTarget = 0;
  private velocity = 0;

  constructor() {
    super('ShopScene');
  }

  private handleResize(): void {
    const { width, height } = this.scale;
    this.bg.setDisplaySize(width, height);

    this.title.setX(width / 2);
    this.subtitle.setX(width / 2);
    this.backBtn.setPosition(64, 88);
    this.coin.setPosition(width - 46, 92);
    this.rpText.setX(width - 130);
    this.infoText.setX(width / 2).setY(height - 64);
    this.infoText.setWordWrapWidth(Math.min(680, width - 40));
    this.hintText.setX(width / 2);
    this.hintText.setWordWrapWidth(Math.max(200, Math.min(520, width - 420)));

    this.layoutCards();
    this.recomputeScroll();
  }

  private layoutCards(): void {
    const cardX = this.scale.width / 2;
    const cardW = Math.min(742, this.scale.width - 16);
    for (const card of this.cards) {
      const left = cardX - cardW / 2;
      const right = cardX + cardW / 2;
      card.rect.setX(cardX).setSize(cardW, this.cardH);
      card.icon.setX(left + 46);
      card.name.setX(left + 88);
      card.category.setX(left + 88);
      card.desc.setX(left + 88);
      card.desc.setWordWrapWidth(Math.max(80, right - 240 - (left + 88)));
      card.coin.setX(right - 214);
      card.cost.setX(right - 202);
      card.count.setX(right - 202);
      card.buyBtn.setX(right - 96);
    }
  }

  private recomputeScroll(): void {
    const startTop = 120;
    const contentBottom = startTop + this.cards.length * (this.cardH + this.gap);
    const viewBottom = this.scale.height - 104;
    this.maxScroll = 0;
    this.minScroll = Math.min(0, viewBottom - contentBottom);
    this.setScroll(this.scrollY);
  }

  create(): void {
    const { width, height } = this.scale;
    this.bg = this.add.image(0, 0, 'results_bg').setOrigin(0).setDisplaySize(width, height);

    this.title = this.add.text(width / 2, 34, 'MARINE SCIENCE LAB', {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#4dd0e1',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.subtitle = this.add.text(width / 2, 64, 'Spend Research Points (RP) on real-world solutions to save marine life', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#b3e5fc',
    }).setOrigin(0.5);

    this.backBtn = this.add.text(64, 88, '< BACK TO MENU', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: 'rgba(38,166,154,0.95)',
      padding: { x: 16, y: 9 },
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).setDepth(1300);
    this.backBtn.on('pointerover', () => this.backBtn.setBackgroundColor('rgba(0,150,136,1)'));
    this.backBtn.on('pointerout', () => this.backBtn.setBackgroundColor('rgba(38,166,154,0.95)'));
    this.backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.coin = this.add.image(width - 46, 92, 'rr_coin').setScale(1.8);
    this.rpText = this.add.text(width - 130, 92, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffd54f',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(1, 0.5);
    this.refreshWallet();

    this.infoText = this.add.text(width / 2, height - 64, 'Tap a tool to learn how it works in the real world', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#fff9c4',
      backgroundColor: 'rgba(16,34,64,0.9)',
      padding: { x: 14, y: 10 },
      wordWrap: { width: Math.min(680, width - 40) },
      align: 'center',
    }).setOrigin(0.5).setDepth(1200);

    this.buildList();

    const hintW = Math.max(200, Math.min(520, width - 420));
    this.hintText = this.add.text(width / 2, 104, 'drag or scroll to browse  ·  tap a card to read its story', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#90caf9',
      wordWrap: { width: hintW },
      align: 'center',
    }).setOrigin(0.5);

    this.scale.on('resize', this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
    });

    // Smooth scrolling: drag with inertia + wheel
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.dragging = true;
      this.dragLastY = pointer.y;
      this.velocity = 0;
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.dragging) return;
      const dy = pointer.y - this.dragLastY;
      this.dragLastY = pointer.y;
      this.velocity = -dy; // px/event -> smoothed in update
      this.setScroll(this.scrollY + dy);
    });
    this.input.on('pointerup', () => {
      this.dragging = false;
    });
    this.input.on('wheel', (_p: Phaser.Input.Pointer, _o: unknown, deltaY: number) => {
      this.wheelTarget += deltaY * 2.2;
    });

    this.events.on(Phaser.Scenes.Events.UPDATE, this.updateScroll, this);
  }

  private updateScroll(): void {
    // Smoothly ease the wheel target toward the current scroll.
    if (Math.abs(this.wheelTarget) > 0.5) {
      const step = this.wheelTarget * 0.18;
      const prev = this.scrollY;
      this.setScroll(this.scrollY + step);
      const applied = this.scrollY - prev;
      this.wheelTarget -= applied;
      if (this.wheelTarget < 0.5) this.wheelTarget = 0;
    } else {
      this.wheelTarget = 0;
    }

    // Inertia after a drag release.
    if (!this.dragging && Math.abs(this.velocity) > 0.5) {
      this.setScroll(this.scrollY + this.velocity * 0.15);
      this.velocity *= 0.92;
      if (Math.abs(this.velocity) < 0.5) this.velocity = 0;
    }
  }

  private buildList(): void {
    const startTop = 120;
    this.cards = SHOP_ITEMS.map((item, i) => {
      const top = startTop + i * (this.cardH + this.gap);
      return this.buildCard(item, top);
    });

    this.recomputeScroll();
  }

  private buildCard(item: ShopItem, top: number): Card {
    const { width } = this.scale;
    const cardX = width / 2;
    const cardW = Math.min(742, width - 16);
    const right = cardX + cardW / 2;
    const left = cardX - cardW / 2;

    const rect = this.add.rectangle(cardX, top, cardW, this.cardH, 0x0d1b2a, 0.95)
      .setStrokeStyle(2, 0x2e5473, 1)
      .setInteractive({ useHandCursor: true });

    const icon = this.add.image(left + 46, top, item.iconKey).setScale(2.8);

    const name = this.add.text(left + 88, top - 26, item.name, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);

    const category = this.add.text(left + 88, top - 2, item.category, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#81d4fa',
    }).setOrigin(0, 0.5);

    const desc = this.add.text(left + 88, top + 22, item.description, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#cfd8dc',
      wordWrap: { width: Math.max(80, right - 240 - (left + 88)) },
    }).setOrigin(0, 0.5);

    const coin = this.add.image(right - 214, top - 16, 'rr_coin').setScale(1.2);

    const cost = this.add.text(right - 202, top - 16, `${item.cost} RR`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffd54f',
    }).setOrigin(0, 0.5);

    const count = this.add.text(right - 202, top + 18, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#a5d6a7',
    }).setOrigin(0, 0.5);

    const buyBtn = this.add.text(right - 96, top, 'BUY', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: 'rgba(38,166,154,0.95)',
      padding: { x: 18, y: 9 },
      fixedWidth: 92,
      align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    rect.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (Math.hypot(pointer.upY - pointer.downY, pointer.upX - pointer.downX) > 10) return;
      this.infoText.setText(item.fact);
      this.infoText.setY(this.scale.height - 64);
    });

    buyBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.clickDown = { x: pointer.x, y: pointer.y };
    });
    buyBtn.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.clickDown && Math.hypot(pointer.x - this.clickDown.x, pointer.y - this.clickDown.y) <= 10) {
        this.tryBuy(item);
      }
      this.clickDown = null;
    });

    const card: Card = { item, top, rect, icon, name, category, desc, coin, cost, count, buyBtn };
    this.refreshCard(card);
    return card;
  }

  private clickDown: { x: number; y: number } | null = null;

  private setScroll(y: number): void {
    this.scrollY = clamp(y, this.minScroll, this.maxScroll);
    for (const card of this.cards) {
      const dy = this.scrollY;
      card.rect.y = card.top + dy;
      card.icon.y = card.top + dy;
      card.name.y = card.top + dy - 26;
      card.category.y = card.top + dy - 2;
      card.desc.y = card.top + dy + 22;
      card.coin.y = card.top + dy - 16;
      card.cost.y = card.top + dy - 16;
      card.count.y = card.top + dy + 18;
      card.buyBtn.y = card.top + dy;
    }
  }

  private refreshCard(card: Card): void {
    const { item, buyBtn, count } = card;
    if (item.kind === 'permanent') {
      const owned = hasUpgrade(item.id);
      buyBtn.setText(owned ? 'OWNED' : 'BUY');
      buyBtn.setBackgroundColor(owned ? 'rgba(60,80,100,0.9)' : 'rgba(38,166,154,0.95)');
      buyBtn.setAlpha(owned ? 0.7 : 1);
      count.setText(owned ? 'Owned' : '');
    } else {
      const c = getConsumableCount(item.id);
      buyBtn.setText(c >= 5 ? 'FULL' : 'BUY');
      buyBtn.setBackgroundColor(c >= 5 ? 'rgba(90,90,90,0.9)' : 'rgba(38,166,154,0.95)');
      buyBtn.setAlpha(1);
      count.setText(c > 0 ? `Owned x${c}` : '');
    }
  }

  private tryBuy(item: ShopItem): void {
    if (item.kind === 'permanent' && hasUpgrade(item.id)) return;
    if (item.kind === 'consumable' && getConsumableCount(item.id) >= 5) return;

    if (!canAfford(item.cost)) {
      this.sound.play('sfx_hurt');
      this.infoText.setText(`Not enough RP — you need ${item.cost - gameState.researchPoints} more RP. Collect plastic and rescue marine life.`);
      this.infoText.setY(this.scale.height - 64);
      return;
    }

    const ok = buyShopItem(item.id as ShopItemId);
    if (!ok) return;
    this.sound.play('sfx_buy');
    this.infoText.setText(`Purchased ${item.name}! ${item.fact}`.slice(0, 260));
    this.infoText.setY(this.scale.height - 64);
    this.refreshWallet();
    this.cards.forEach((c) => this.refreshCard(c));
  }

  private refreshWallet(): void {
    this.rpText.setText(`${gameState.researchPoints} RR`);
  }
}