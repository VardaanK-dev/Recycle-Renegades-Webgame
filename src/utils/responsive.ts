import Phaser from 'phaser';

/**
 * Responsive-fit helper for static UI scenes (Menu, Shop, Results, Credits).
 *
 * Content is laid out in a `designW x designH` coordinate space (same pixel
 * positions the scenes already use). On every resize the container is uniformly
 * scaled to fit the window and centered, so the UI scales to any size (freeform,
 * fullscreen-safe) without a refresh.
 *
 * Usage:
 *   const container = this.add.container(0, 0);
 *   ... this.add.text(x, y, ...) to container.add(el) (or container.add([...]))
 *   const off = setUpResponsiveFit(this, container, 800, 600, this.shutdownCleanup);
 */
export function setUpResponsiveFit(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  designW: number,
  designH: number,
  onDestroy?: () => void,
): void {
  const fit = () => {
    const w = scene.scale.width;
    const h = scene.scale.height;
    const scale = Math.min(w / designW, h / designH);
    // Anchor the design-space (0,0) at the top-left of the scaled, centered area
    container.setScale(scale);
    container.setPosition(w / 2 - (designW * scale) / 2, h / 2 - (designH * scale) / 2);
  };

  fit();
  scene.scale.on('resize', fit, scene);

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off('resize', fit, scene);
    onDestroy?.();
  });
}