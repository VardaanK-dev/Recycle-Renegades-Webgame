import Phaser from 'phaser';

export class ParallaxBg {
  private scene: Phaser.Scene;
  private layers: { image: Phaser.GameObjects.TileSprite; factor: number }[] = [];
  private seafloor!: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene, bgColor: string) {
    this.scene = scene;
    this.create(bgColor);
  }

  private create(bgColor: string): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;

    const far = this.scene.add
      .tileSprite(0, 0, w, h, 'bg_deep')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-100);
    const mid = this.scene.add
      .tileSprite(0, 0, w, h, 'bg_mid')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-90)
      .setAlpha(0.7);
    const near = this.scene.add
      .tileSprite(0, 0, w, h, 'bg_surface')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-80)
      .setAlpha(0.5);

    this.seafloor = this.scene.add
      .tileSprite(0, h * 0.7, w, h * 0.3, 'seafloor')
      .setOrigin(0, 0)
      .setDepth(-50);

    this.layers = [
      { image: far, factor: 0.2 },
      { image: mid, factor: 0.4 },
      { image: near, factor: 0.6 },
    ];
  }

  resize(w: number, h: number): void {
    for (const layer of this.layers) {
      layer.image.setSize(w, h);
    }
    this.seafloor.setSize(w, h * 0.3).setPosition(0, h * 0.7);
  }

  update(cameraX: number): void {
    const camW = this.scene.scale.width;
    for (const layer of this.layers) {
      layer.image.setTilePosition(cameraX * layer.factor);
    }
    this.seafloor.setTilePosition(cameraX * 0.8);
  }
}
