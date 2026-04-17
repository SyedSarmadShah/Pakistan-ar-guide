# AI Coding Agent Guide: Pakistan AR Guide

Concise, project-specific instructions to help AI agents contribute effectively to this Vite + React app that performs camera-based monument recognition using Teachable Machine and the Web Speech API.

## Big Picture

- App type: Single-page React app built with Vite; entry HTML is `index.html` at repo root.
- Core feature: Live camera feed → Teachable Machine model prediction → place lookup → UI overlays + audio narration.
- Key logic lives in `src/App.jsx` with a local `placesDatabase` that maps recognized class names to rich place metadata and UI markers.
- Static assets and ad-hoc tools live in `public/` (e.g., `public/test.html` for camera debugging); these are served verbatim by Vite.

## Architecture & Data Flow

- Entry: `index.html` loads `src/index.jsx` which mounts `App`.
- UI: `src/App.jsx` renders camera view and overlays (markers, info drawer, status toasts). Icons from `lucide-react`; Tailwind via CDN in HTML.
- Model: `@teachablemachine/image` loads from `MODEL_URL` (`model.json` + `metadata.json`). See `MODEL_URL` constant near top of `src/App.jsx`.
- Camera: `navigator.mediaDevices.getUserMedia` requests 1280x720 video and binds to `videoRef`.
- Recognition loop: `startScanning()` runs every 2000ms, calls `modelRef.current.predict(video)`, picks max probability. If `$p > 0.7`, normalizes class name and looks up in `placesDatabase`.
- Narration: Uses `window.speechSynthesis` to speak `place.narration`; toggles `isSpeaking` state.

## Build, Run, Preview

- Install: `npm install`
- Dev: `npm run dev` (Vite server on port 3000; host enabled in `vite.config.js`).
- Preview build: `npm run build` then `npm run preview`.
- Camera test page: open `http://localhost:3000/test.html` to isolate camera issues (uses `public/test.html`).

## Conventions & Patterns

- Class name normalization: predicted `className` is lowercased and stripped to `[a-z]` before matching keys in `placesDatabase` (e.g., "Badshahi Mosque" → `badshahi`). Keep keys simple, lowercase, alpha-only.
- Confidence threshold: recognition requires probability `> 0.7`. Adjust in `recognizePlace()` and `startScanning()` together for consistency.
- Scan cadence: 2000ms `setInterval`. Clear interval upon successful recognition to avoid redundant speech/updates.
- Status messaging: Use `updateStatus(msg, type)` for user feedback; types: `loading | success | error | info`. Prefer this over `console.log` alone.
- Styling: Tailwind loaded via CDN in HTML; no PostCSS config. Keep component styles minimal and rely on Tailwind utility classes.
- ESBuild JSX loader: `vite.config.js` maps `.js` to `jsx` for optimizeDeps. Prefer `.jsx` files; avoid relying on `.js` unless necessary.

## Key Files

- `index.html`: Root entry HTML; loads Tailwind CDN and `src/index.jsx`.
- `src/index.jsx`: React root; mounts `App` with `React.StrictMode`.
- `src/App.jsx`: Camera, model loading, prediction loop, narration, overlays, and place metadata.
- `vite.config.js`: React plugin, esbuild loader tweaks, dev server `host: true`, `port: 3000`.
- `public/test.html`: Minimal camera sanity-check page; useful for permission/debug.

## External Integrations

- Teachable Machine: `@teachablemachine/image` + model hosted at `MODEL_URL`. To update models, replace `MODEL_URL` and ensure classes match `placesDatabase` keys.
- Web Speech API: `speechSynthesis` for narration; cancel ongoing speech before speaking new text.
- MediaDevices: requires secure context (https or localhost). Mobile browsers may need user gestures; use the Start button.

## Extending Recognition (Example)

1. Train/publish a new Teachable Machine model; update `MODEL_URL` in `src/App.jsx`.
2. Add a new entry in `placesDatabase` (key must match normalized class name):
   - `name`, `location`, `period`, `description`, `narration`, `facts: string[]`, `markers: { id, label, x, y }[]` where `x/y` are percentages for overlay placement.
3. Verify with the camera: ensure the new class appears with `> 0.7` confidence; adjust markers.

## Debugging Notes

- If model fails: `loadModel()` logs and sets status; check network to `model.json`/`metadata.json`.
- If camera fails: use `public/test.html` to isolate. Confirm permissions and HTTPS. Inspect `statusMessage` and console.
- If speech fails: desktop Safari/Firefox may have limitations; ensure `speechSynthesis` exists before calling.

## Non-Goals

- No backend/API layer in this repo; all recognition is client-side.
- No test suite configured; focus on UI/UX manual verification via dev server.

—
Questions or missing details? Reply with areas to clarify (e.g., adding places, model hosting, mobile constraints) and I’ll refine these instructions.
