import Phaser from 'phaser';
import { SHOP_ITEMS } from '../config/gameData';
import { getConsumableCount } from '../systems/EconomyManager';
import { ShopItem, ShopItemId } from '../types';

interface ToolSlot {
  id: ShopItemId;
  image: Phaser.GameObjects.Image;
  badge: Phaser.GameObjects.Text;
  keyLabel: Phaser.GameObjects.Text;
}

export class ConsumableBar {
  private scene: Phaser.Scene;
  private onUse: (id: ShopItemId) => void;
  private slots: ToolSlot[] = [];
  private clickDown: { id: ShopItemId; x: number; y: number } | null = null;
  private shown = false;

  constructor(scene: Phaser.Scene, onUse: (id: ShopItemId) => void) {
    this.scene = scene;
    this.onUse = onUse;
    this.create();
  }

  private get consumables(): ShopItem[] {
    return SHOP_ITEMS.filter((s) => s.kind === 'consumable');
  }

  private create(): void {
    const { width, height } = this.scene.scale;
    const list = this.consumables;
    const slotSize = 44;
    const gap = 6;
    const totalW = list.length * slotSize + (list.length - 1) * gap;
    const baseX = width / 2 - totalW / 2 + slotSize / 2;
    const baseY = height - 44;

    list.forEach((item, i) => {
      const x = baseX + i * (slotSize + gap);
      const image = this.scene.add
        .image(x, baseY, item.iconKey)
        .setScrollFactor(0)
        .setDepth(1002)
        .setScale(2.2)
        .setAlpha(0.95)
        .setVisible(false)
        .setTint(0xffffff);

      const keyIndex = i + 1;
      const keyLabel = this.scene.add
        .text(x - slotSize / 2 + 7, baseY - slotSize / 2 + 8, String(keyIndex), {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#90a4ae',
          backgroundColor: 'rgba(10,20,40,0.8)',
          padding: { x: 2, y: 1 },
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1002)
        .setVisible(false);

      const badge = this.scene.add
        .text(x + slotSize / 2 - 8, baseY + slotSize / 2 - 8, '', {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: 'rgba(10,20,40,0.9)',
          padding: { x: 3, y: 2 },
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1003)
        .setVisible(false);

      image.setInteractive({ useHandCursor: true });
      image.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.clickDown = { id: item.id, x: pointer.x, y: pointer.y };
      });
      image.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (!this.clickDown || this.clickDown.id !== item.id) return;
        const moved = Math.hypot(pointer.x - this.clickDown.x, pointer.y - this.clickDown.y);
        this.clickDown = null;
        if (moved > 10) return;
        if (getConsumableCount(item.id) > 0) {
          this.onUse(item.id);
        }
      });

      this.slots.push({ id: item.id, image, badge, keyLabel });
      this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    });
  }

  refresh(): void {
    const { width, height } = this.scene.scale;
    const list = this.consumables;
    const slotSize = 44;
    const gap = 6;
    const totalW = list.length * slotSize + (list.length - 1) * gap;
    const baseX = width / 2 - totalW / 2 + slotSize / 2;
    const baseY = height - 44;
    const idxOf = new Map(list.map((s, i) => [s.id, i]));

    let anyShown = false;
    for (const slot of this.slots) {
      const count = getConsumableCount(slot.id);
      const i = idxOf.get(slot.id) ?? 0;
      const x = baseX + i * (slotSize + gap);
      const y = baseY;
      slot.image.setPosition(x, y).setVisible(count > 0);
      slot.image.setTint(count > 0 ? 0xffffff : 0x555555);
      slot.badge.setPosition(x + slotSize / 2 - 8, y + slotSize / 2 - 8);
      slot.badge.setText(count > 0 ? String(count) : '').setVisible(count > 0);
      slot.keyLabel.setPosition(x - slotSize / 2 + 7, y - slotSize / 2 + 8).setVisible(count > 0);
      if (count > 0) anyShown = true;
    }

    // key labels stay fixed since the layout is static across levels
    this.shown = anyShown;
  }

  setVisible(v: boolean): void {
    this.shown = v;
  }

  handleKey(index: number): void {
    const item = this.consumables[index];
    if (item && getConsumableCount(item.id) > 0) {
      this.onUse(item.id);
    }
  }

  destroy(): void {
    this.slots.forEach((s) => {
      s.image.destroy();
      s.badge.destroy();
      s.keyLabel.destroy();
    });
    this.slots = [];
  }
}