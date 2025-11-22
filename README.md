# DreamCanvas AI image studio

This project is a static demo site that simulates an AI image creation workflow. It generates placeholder images locally in the browser so you can design the end-to-end user experience before wiring it to a real model.

## Features
- Prompt-driven generator with style, size, palette, seed, and guidance controls.
- Live preview panel and quick prompt suggestion chips.
- Gallery with filters, favorites, downloads, sharing, and deletion.
- Prompt history with reuse and export options.
- Lightweight Node server for local hosting.

## Getting started
1. Install a recent version of Node.js (v18+ recommended).
2. From the project root, start the static server:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000` in your browser and begin generating placeholder images.

## Notes
- All generations are stored in memory for the active session only; refreshing clears them.
- Clipboard operations and downloads rely on browser capabilities.
