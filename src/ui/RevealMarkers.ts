import Phaser from 'phaser';
import { MarineLife } from '../entities/MarineLife';

interface Entry {
  marine: MarineLife;
  marker: Phaser.GameObjects.Image | null;
  arrow: Phaser.GameObjects.Triangle | null;
}

/**
 * Draws reveal markers for trapped marine life during the Drone Survey (and
 * Community Alert) power-up: a bouncing star above each on-screen creature and a
 * screen-edge arrow pointing toward each off-screen creature so the player knows
 * exactly where to swim.
 */
export class RevealMarkers {
  private scene: Phaser.Scene;
  private entries: Entry[] = [];
  private activeUntil = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  private destroyEntry(e: Entry): void {
    if (e.marker) { e.marker.destroy(); e.marker = null; }
    if (e.arrow) { e.arrow.destroy(); e.arrow = null; }
  }

  /** Set the reveal active until the given timestamp. Targets = all trapped marines. */
  activate(marineGroup: Phaser.Physics.Arcade.Group, until: number): void {
    this.activeUntil = until;
    const seen = new Set<MarineLife>();
    for (const child of marineGroup.getChildren()) {
      seen.add(child as MarineLife);
    }

    // Drop entries for marines no longer tracked.
    for (let i = this.entries.length - 1; i >= 0; i--) {
      if (!seen.has(this.entries[i].marine)) {
        this.destroyEntry(this.entries[i]);
        this.entries.splice(i, 1);
      }
    }

    // Add entries for newly spawned, still-trapped marines.
    for (const marine of seen) {
      if (marine.rescued) continue;
      if (this.entries.some((e) => e.marine === marine)) continue;
      this.entries.push({ marine, marker: null, arrow: null });
    }
  }

  /** Update marker positions and visibility for the current camera. */
  update(now: number): void {
    const expired = now >= this.activeUntil;
    const cam = this.scene.cameras.main;
    const camW = cam.width;
    const camH = cam.height;
    const scrollX = cam.scrollX;
    const scrollY = cam.scrollY;
    const pad = 14;

    for (const e of this.entries) {
      const marine = e.marine;
      if (!marine.active || marine.rescued) {
        this.destroyEntry(e);
        e.marker = null;
        e.arrow = null;
        continue;
      }

      const mx = marine.x - scrollX;
      const my = marine.y - scrollY;

      if (expired) {
        this.destroyEntry(e);
        e.marker = null;
        e.arrow = null;
        continue;
      }

      const onScreen = mx > -20 && mx < camW + 20 && my > -20 && my < camH + 20;

      if (!onScreen) {
        // Off-screen: screen-edge arrow pointing at the creature.
        if (e.marker) { e.marker.destroy(); e.marker = null; }
        let arrow = e.arrow;
        if (!arrow) {
          arrow = this.scene.add
            .triangle(0, 0, 10, 0, 0, 14, 20, 14, 0xffd54f, 1)
            .setStrokeStyle(2, 0x000000, 0.7)
            .setScrollFactor(0)
            .setDepth(1200);
          e.arrow = arrow;
        }

        const clampedX = Phaser.Math.Clamp(mx, pad, camW - pad);
        const clampedY = Phaser.Math.Clamp(my, pad, camH - pad);
        arrow.setPosition(clampedX, clampedY);

        const dx = mx - clampedX;
        const dy = my - clampedY;
        const angle = Math.atan2(dy, dx);
        arrow.setRotation(angle + Math.PI / 2);
        arrow.setVisible(true);
      } else {
        // On-screen: bouncing star above the creature (scrollFactor 0 = screen space).
        if (e.arrow) { e.arrow.destroy(); e.arrow = null; }
        let marker = e.marker;
        if (!marker) {
          marker = this.scene.add
            .image(mx, my - 26, 'star')
            .setScrollFactor(0)
            .setScale(1.4)
            .setDepth(1201);
          e.marker = marker;
        }
        const bounce = Math.sin(now / 250) * 7;
        marker.setPosition(mx, my - 26 - bounce);
        marker.setVisible(true);
      }
    }

    if (expired) {
      this.activeUntil = 0;
      this.entries = [];
    }
  }

  /** Immediately remove all markers. */
  clear(): void {
    for (const e of this.entries) this.destroyEntry(e);
    this.entries = [];
    this.activeUntil = 0;
  }
}