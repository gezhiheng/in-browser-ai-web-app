# In-browser AI Web App

Vue + Vite playground for running “AI demos” directly in the browser.

## Features

- **Gesture Confetti**: uses MediaPipe to recognize a “Victory/Peace” sign and triggers confetti.
- **Speech to Text**: runs Whisper via Transformers.js (in a worker) to transcribe audio locally.
- **Face Landmarker**: links to the official MediaPipe Studio Face Landmarker demo.
- **i18n**: English / 中文 built-in via `vue-i18n`.

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Tailwind CSS
- `vue-router` (file-based routes via `unplugin-vue-router`)
- `pinia`

## Getting Started

### Prerequisites

- Node.js: `^20.19.0 || >=22.12.0`
- pnpm (see `packageManager` in `package.json`)

### Install

```bash
pnpm install
```

### Run Dev Server

```bash
pnpm dev
```

Then open the URL printed by Vite (usually `http://localhost:5173`).

## Demos & Routes

- Home: `/`
- Confetti: `/confetti`
- Speech to Text: `/speech2Text`
- Face Landmarker:
	- Home card opens the **official** demo in a new tab: `https://mediapipe-studio.webapps.google.com/demo/face_landmarker`
	- There is also an **embedded** page: `/faceDetection` (iframe)

## Notes

- **Camera permissions**: Some browsers block camera access inside iframes. If the embedded Face Landmarker page can’t access the camera, use the “Open in new tab” link.
- **Language**: The app auto-detects locale on first load and stores it in `localStorage`.

## Scripts

```bash
pnpm dev        # start Vite dev server
pnpm build      # type-check then build
pnpm type-check # vue-tsc
pnpm lint       # eslint (auto-fix enabled)
pnpm preview    # preview production build
```
