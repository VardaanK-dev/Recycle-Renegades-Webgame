import Phaser from 'phaser';

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
}

export class InputManager {
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private spaceKey!: Phaser.Input.Keyboard.Key;

  state: InputState = { up: false, down: false, left: false, right: false, action: false };

  // Virtual joystick state (used by touch overlay)
  touchVector = { x: 0, y: 0 };
  touchAction = false;
  private actionHeld = false;
  actionJustPressed = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasdKeys = scene.input.keyboard!.addKeys('W,A,S,D') as unknown as {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    scene.events.on('preupdate', () => {
      this.actionJustPressed =
        Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        (this.touchAction && !this.actionHeld);
      this.actionHeld = this.spaceKey.isDown || this.touchAction;
    });
  }

  update(): void {
    const k = this.state;
    const c = this.cursors;
    const w = this.wasdKeys;

    k.up = c.up.isDown || w.W.isDown;
    k.down = c.down.isDown || w.S.isDown;
    k.left = c.left.isDown || w.A.isDown;
    k.right = c.right.isDown || w.D.isDown;
    k.action = this.spaceKey.isDown || this.touchAction;

    // If touch is active, override with joystick
    if (this.touchVector.x !== 0 || this.touchVector.y !== 0) {
      k.left = this.touchVector.x < -0.2;
      k.right = this.touchVector.x > 0.2;
      k.up = this.touchVector.y < -0.2;
      k.down = this.touchVector.y > 0.2;
    }
    if (this.touchAction) k.action = true;
  }

  getDirection(normalized = false): { x: number; y: number } {
    const d = { x: 0, y: 0 };
    if (this.state.left) d.x -= 1;
    if (this.state.right) d.x += 1;
    if (this.state.up) d.y -= 1;
    if (this.state.down) d.y += 1;
    if (normalized) {
      const len = Math.hypot(d.x, d.y);
      if (len > 0) {
        d.x /= len;
        d.y /= len;
      }
    }
    return d;
  }

  isMoving(): boolean {
    return this.state.up || this.state.down || this.state.left || this.state.right;
  }
}
