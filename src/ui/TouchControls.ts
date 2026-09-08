import Phaser from 'phaser';
import { InputManager } from '../systems/InputManager';

export class TouchControls {
  private scene: Phaser.Scene;
  private input: InputManager;
  private joystickBase!: Phaser.GameObjects.Image;
  private joystickKnob!: Phaser.GameObjects.Image;
  private actionBtn!: Phaser.GameObjects.Image;
  private actionSymbol!: Phaser.GameObjects.Image;
  private actionStar!: Phaser.GameObjects.Image;
  private joystickLabel!: Phaser.GameObjects.Text;
  private actionLabel!: Phaser.GameObjects.Text;
  private activeJoystick: boolean = false;
  private joystickPointerId: number | null = null;
  private actionPointerId: number | null = null;
  private joystickOrigin = { x: 0, y: 0 };
  private radius = 45;
  private margin = 70;
  private controlScale = 4;
  private visible = false;

  constructor(scene: Phaser.Scene, input: InputManager) {
    this.scene = scene;
    this.input = input;
    this.create();
  }

  private create(): void {
    const { width, height } = this.scene.scale;
    const margin = this.margin;
    const scale = this.controlScale;

    this.joystickBase = this.scene.add
      .image(margin, height - margin, 'joystick_base')
      .setScrollFactor(0)
      .setAlpha(0.85)
      .setScale(scale)
      .setDepth(1000)
      .setVisible(false);

    this.joystickKnob = this.scene.add
      .image(margin, height - margin, 'joystick_knob')
      .setScrollFactor(0)
      .setAlpha(0.95)
      .setScale(scale)
      .setDepth(1001)
      .setVisible(false);

    this.actionBtn = this.scene.add
      .image(width - margin, height - margin, 'action_button')
      .setScrollFactor(0)
      .setAlpha(0.9)
      .setScale(scale)
      .setDepth(1000)
      .setVisible(false);

    // Dash bolt symbol in the centre of the action button
    this.actionSymbol = this.scene.add
      .image(width - margin - 6, height - margin - 2, 'action_symbol')
      .setScrollFactor(0)
      .setAlpha(0.95)
      .setScale(scale * 0.32)
      .setDepth(1001)
      .setVisible(false);

    // Rescue star badge on the top-right of the action button
    this.actionStar = this.scene.add
      .image(width - margin + 20, height - margin - 20, 'star')
      .setScrollFactor(0)
      .setAlpha(0.95)
      .setScale(scale * 0.3)
      .setDepth(1001)
      .setVisible(false);

    this.joystickLabel = this.scene.add
      .text(margin, height - margin + 48, 'MOVE', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0.9)
      .setDepth(1002)
      .setVisible(false);

    this.actionLabel = this.scene.add
      .text(width - margin, height - margin + 48, 'DASH / RESCUE', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0.9)
      .setDepth(1002)
      .setVisible(false);

    this.setupEvents();
  }

  resize(): void {
    const { width, height } = this.scene.scale;
    const margin = this.margin;
    this.joystickBase.setPosition(margin, height - margin);
    this.joystickKnob.setPosition(margin, height - margin);
    this.actionBtn.setPosition(width - margin, height - margin);
    this.actionSymbol.setPosition(width - margin - 6, height - margin - 2);
    this.actionStar.setPosition(width - margin + 20, height - margin - 20);
    this.joystickLabel.setPosition(margin, height - margin + 48);
    this.actionLabel.setPosition(width - margin, height - margin + 48);
    this.joystickOrigin = { x: margin, y: height - margin };
    this.activeJoystick = false;
    this.input.touchVector = { x: 0, y: 0 };
  }

  private setupEvents(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.visible) return;
      this.processPointerDown(pointer);
    });
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.visible) return;
      this.processPointerMove(pointer);
    });
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.visible) return;
      this.processPointerUp(pointer);
    });
    this.scene.input.on('pointerupoutside', (pointer: Phaser.Input.Pointer) => {
      if (!this.visible) return;
      this.processPointerUp(pointer);
    });
  }

  private isTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (this.scene.game.device.input.touch as unknown as boolean)
    );
  }

  show(): void {
    this.visible = this.isTouchDevice();
    if (!this.visible) return;
    this.joystickBase.setVisible(true);
    this.joystickKnob.setVisible(true);
    this.actionBtn.setVisible(true);
    this.actionSymbol.setVisible(true);
    this.actionStar.setVisible(true);
    this.joystickLabel.setVisible(true);
    this.actionLabel.setVisible(true);
  }

  hide(): void {
    this.visible = false;
    this.joystickBase.setVisible(false);
    this.joystickKnob.setVisible(false);
    this.actionBtn.setVisible(false);
    this.actionSymbol.setVisible(false);
    this.actionStar.setVisible(false);
    this.joystickLabel.setVisible(false);
    this.actionLabel.setVisible(false);
    this.input.touchVector = { x: 0, y: 0 };
  }

  get isVisible(): boolean {
    return this.visible;
  }

  private isPointerInJoystick(pointer: Phaser.Input.Pointer): boolean {
    const { width, height } = this.scene.scale;
    const cx = this.margin;
    const cy = height - this.margin;
    return Math.hypot(pointer.x - cx, pointer.y - cy) < this.radius * 2.4;
  }

  private isPointerInAction(pointer: Phaser.Input.Pointer): boolean {
    const { width, height } = this.scene.scale;
    const cx = width - this.margin;
    const cy = height - this.margin;
    return Math.hypot(pointer.x - cx, pointer.y - cy) < this.radius * 2.4;
  }

  private processPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.joystickPointerId === null && this.isPointerInJoystick(pointer)) {
      this.joystickPointerId = pointer.id;
      this.activeJoystick = true;
      this.joystickOrigin = { x: pointer.x, y: pointer.y };
      this.joystickBase.setPosition(pointer.x, pointer.y);
      this.joystickKnob.setPosition(pointer.x, pointer.y);
      this.joystickBase.setAlpha(1);
    } else if (this.actionPointerId === null && this.isPointerInAction(pointer)) {
      this.actionPointerId = pointer.id;
      this.input.touchAction = true;
      this.actionBtn.setScale(this.controlScale * 0.9);
      this.actionSymbol.setScale(this.controlScale * 0.3);
      this.actionStar.setScale(this.controlScale * 0.27);
    }
  }

  private processPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.activeJoystick && pointer.id === this.joystickPointerId) {
      const dx = pointer.x - this.joystickOrigin.x;
      const dy = pointer.y - this.joystickOrigin.y;
      const dist = Math.hypot(dx, dy);
      const clampDist = Math.min(dist, this.radius);
      const normDist = dist > 0 ? clampDist : 0;
      const angle = dist > 0 ? Math.atan2(dy, dx) : 0;
      this.joystickKnob.setPosition(
        this.joystickOrigin.x + Math.cos(angle) * normDist,
        this.joystickOrigin.y + Math.sin(angle) * normDist
      );
      const power = this.radius > 0 ? clampDist / this.radius : 0;
      const x = dist > 0 ? (dx / dist) * power : 0;
      const y = dist > 0 ? (dy / dist) * power : 0;
      this.input.touchVector = { x, y };
    }
  }

  private processPointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.joystickPointerId) {
      this.joystickPointerId = null;
      this.activeJoystick = false;
      this.input.touchVector = { x: 0, y: 0 };
      const { width, height } = this.scene.scale;
      const margin = this.margin;
      this.joystickBase.setPosition(margin, height - margin);
      this.joystickKnob.setPosition(margin, height - margin);
      this.joystickBase.setAlpha(0.85);
    }
    if (pointer.id === this.actionPointerId) {
      this.actionPointerId = null;
      this.input.touchAction = false;
      this.actionBtn.setScale(this.controlScale);
      this.actionSymbol.setScale(this.controlScale * 0.32);
      this.actionStar.setScale(this.controlScale * 0.3);
    }
  }
}
