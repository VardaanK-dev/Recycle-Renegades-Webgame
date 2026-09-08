import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/gameConfig';
import { loadGameState } from './systems/GameState';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { CoralMiniGame } from './scenes/CoralMiniGame';
import { ResultsScene } from './scenes/ResultsScene';
import { ShopScene } from './scenes/ShopScene';
import { CreditsScene } from './scenes/CreditsScene';

loadGameState();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: document.body,
  backgroundColor: '#0a1628',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 },
    },
  },
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },
  audio: {
    disableWebAudio: false,
  },
  scene: [BootScene, MenuScene, GameScene, CoralMiniGame, ResultsScene, ShopScene, CreditsScene],
};

const game = new Phaser.Game(config);

const el = document.getElementById('loading');
if (el) el.remove();

const refreshScale = () => {
  requestAnimationFrame(() => {
    game.scale.refresh();
  });
};

window.addEventListener('resize', refreshScale);
document.addEventListener('fullscreenchange', refreshScale);

// Mobile browsers (esp. iOS) don't always fire window.resize when the address
// bar shows/hides; the VisualViewport API gives us the true visible area.
const vv = window.visualViewport;
if (vv) {
  vv.addEventListener('resize', refreshScale);
  vv.addEventListener('scroll', refreshScale);
}