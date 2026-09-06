# Contributing to Recycle Renegades

Thanks for helping save the ocean — one pixel at a time! 🐠

## Getting started

1. Fork the repository.
2. Clone your fork and install dependencies:

   ```bash
   git clone https://github.com/<your-username>/Recycle-Renegades-webgame.git
   cd Recycle-Renegades-webgame
   npm install
   ```

3. Create a branch for your work:

   ```bash
   git checkout -b feature/my-cool-idea
   ```

## Development loop

- `npm run dev` — start the dev server with hot reload.
- `npm run typecheck` — make sure there are **no TypeScript errors**.
- `npm run build` — verify a clean production build before opening a PR.

## Code style

- TypeScript, strict mode. Prefer explicit types on public APIs.
- Keep scenes thin; put reusable logic in `systems/` and entities in `entities/`.
- No external runtime dependencies unless discussed — the project intentionally bundles nothing beyond Phaser.
- Hardcoded game content (facts, level configs, sprite palettes) lives in `src/config/` so it's easy to tweak.

## Adding a science fact or level

- Facts live on `PlasticDef` entries in `src/config/gameData.ts`. Add/update the `fact` string and it will show up in-game automatically.
- New levels are a single object in the `LEVELS` array in `src/config/gameConfig.ts`.

## Tests

No test framework is configured yet. If you add logic heavier than a one-liner, add it to `src/utils/math.ts` and include unit tests — otherwise keep changes small and clearly named.

## Pull requests

- Reference any related issue in your PR description.
- Update `README.md` if user-facing behavior changes.
- Keep commits focused; squash before merging if needed.

## Questions?

Open an issue — maintainers respond quickly.