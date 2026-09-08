# Recycle Renegades

A web-based **pixel art ocean conservation game** that educates players about the impacts of mismanaged plastic on the ocean while promoting real scientific solutions such as reef restoration, recycling incentives, and community awareness.

![Tech](https://img.shields.io/badge/Phaser-3.90-blue) ![Lang](https://img.shields.io/badge/TypeScript-5.5-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## 🎮 Gameplay
**For best experience PC is recommended**

Dive into the ocean as a diver-renegade and:

- **Collect plastic waste** — bottles, bags, straws, cups and ghost fishing nets drifting through the water.
- **Rescue marine life** — free fish trapped in bags and disentangle turtles fighting for their lives.
- **Restore coral reefs** — a dedicated minigame where you match coral fragments to rebuild degraded reefs.
- **Unlock scientific solutions** — recycling bins, reef seeds, tethered caps, current shields and community alerts act as power-ups, each based on a real-world intervention.
- **Invest in real science** — collecting waste and rescuing life earns **Research Points (RP)**. Spend RP in the **Marine Science Lab** to buy real-world solutions that exist today: Seabin skimmers, the Great Bubble Barrier, Baltimore's Trash Wheel, coral nurseries, drone debris surveys, recycled-mesh nets and efficient swim fins. Each purchase teaches the science behind it.
- **Dodge jellyfish** — drifting stingers appear in deeper levels; one life per sting.
- **Learn as you play** — collecting plastic and using lab tools pops up real science facts.
- **Full screen** — the game fills your browser window and can switch to true fullscreen (FULL button on the menu, Refresh might be needed).
- **Credits** — a CREDITS button on the menu lists the tools used to build the project (Phaser, TypeScript, Vite, opencode, etc.).

## 📣 Launch assets

- **Favicon + web app manifest** (`public/favicon.svg`, `public/manifest.json`) — installable / shareable PWA-lite branding.
- **Social share image** — the results screen clarifies every plastic type, and ready-made **retro/vintage banners** are provided for the website hero and Instagram:
  - `public/assets/banners/hero-1920x600.png`
  - `public/assets/banners/instagram-1080x1080.png`
  - Regenerate them anytime with `python scripts/generate_banners.py`.
- **Open Graph / Twitter cards** in `index.html` use the website hero as the share preview (URLs assume GitHub Pages hosting at `https://anomalyco.github.io/Recycle-Renegades-webgame/`).

## 🎮 Hidden easter eggs

- **PC:** type `/unlockall` on the menu to unlock every level and get 5000 RP. 
- **Mobile / touch:** tap the **RECYCLE RENEGADES title 5 times** quickly on the menu.

## 🧮 Math & Data Integration

Scoring is grounded in math:

- Points scale by item type, rescue difficulty, and coral matching accuracy.
- Combo multipliers reward rapid, efficient collection.
- Level results report **% ocean cleaned** and **% reef restored**.
- The results screen shows donut charts, a per-item bar chart, and a real-world impact comparison (kg of plastic collected → bottles / trash bags worth).

## 🕹️ Controls

| Action | Desktop | Mobile |
|--------|---------|--------|
| Move | WASD or Arrow Keys | Virtual joystick (left thumb, with MOVE label) |
| Dash / rescue | Space | Action button (right thumb — ⚡ bolt + ★ star symbols) |
| Use lab tool | Keys 1–5 | Tap the tool slot (bottom-centre) |

## 🛠️ Tech Stack

- **Phaser 3** (Arcade Physics) — game engine
- **TypeScript 5** — type-safe codebase
- **Vite 6** — fast dev server + optimized production builds
- Zero external assets — all pixel art sprites are **generated programmatically** at boot, so the game has no asset download runtime cost

## 🚀 Run Locally

```bash
npm install
npm run dev        # start dev server (hot reload)
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm run typecheck  # run the TypeScript type checker
```

## 🗺️ Project Structure

```
src/
├── main.ts               # Phaser game entry point + config
├── config/
│   ├── gameConfig.ts     # screen size, player/life constants, level list
│   └── gameData.ts       # plastic, marine life, coral, power-up & shop definitions
├── scenes/
│   ├── BootScene.ts      # generates all pixel art textures + sound FX
│   ├── MenuScene.ts      # title screen, level select, shop access + easter eggs
│   ├── ShopScene.ts      # Marine Science Lab: buy real-world solutions with RP
│   ├── GameScene.ts      # core swim / collect / rescue / tool gameplay
│   ├── CoralMiniGame.ts  # reef restoration minigame
│   ├── ResultsScene.ts   # scoring + data visualizations
│   └── CreditsScene.ts   # tools & engines used to build the project
├── entities/             # Player, PlasticItem, MarineLife, Coral, PowerUp, Jellyfish
├── systems/              # Input, Spawning, Scoring, Economy, Parallax, GameState
├── ui/                   # HUD, TouchControls, ConsumableBar (tool slots)
└── utils/math.ts         # percentage / scoring / impact math
```

### Launch & asset scripts

```
scripts/
└── generate_banners.py  # regenerates the website hero + Instagram banners (needs Pillow)
public/
├── favicon.svg          # icon + apple-touch-icon
├── manifest.json        # PWA-lite web app manifest
└── assets/banners/      # hero-1920x600.png, instagram-1080x1080.png
```

## 🧪 Contributing

Contributions are welcome! Check out [`CONTRIBUTING.md`](CONTRIBUTING.md) for the workflow, and feel free to open issues and pull requests.

### Great first contributions

- More educational fact popups for new plastic item types **and** new lab tools with real-world science backgrounds (easy: add an entry to `SHOP_ITEMS` in `gameData.ts`).
- New levels (easy: add a `LevelConfig` entry).
- New marine species or hazard types.
- Sound effects / background music.
- Additional pixel-art sprites.
- Localized translations (`gameData.ts` facts and UI strings).
- Balancing: RP costs, tool durations, jellyfish frequency and combo tuning.

## 📚 Scientific Background

- [NOAA — Marine Debris Program](https://marinedebris.noaa.gov/)
- [What is coral reef restoration?](https://oceanservice.noaa.gov/facts/coral-reef.html)
- 8 million tonnes of plastic enter the ocean every year (Jambeck et al., 2015).

## 📄 License

MIT — see [`LICENSE`](LICENSE). Pixel art sprites are original procedural art generated by the game; palette inspiration from classic 16-bit ocean games.# Recycle-Renegades-Webgame
