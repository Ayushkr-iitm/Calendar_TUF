# Cinematic Calendar

An interactive wall-calendar experience with a tactile page flip, date-range selection, and notes — built as a frontend engineering challenge project.

## Run on browser:
Note on Mobile phone, run it on desktop view: https://calendar-tuf-eta.vercel.app/


## Run locally

```bash
cd cinematic-calendar-final
npm install
npm run dev
```

Vite prints the local URL in the terminal (typically `http://localhost:8080`, or the next available port).

## Audio note (exact flip sound)

The month flip is wired to use an external recorded file named:

- `public/sounds/page-flip-47177.mp3`

If that file exists, it will be used. If it’s missing, the app falls back to a small synthesized “paper-ish” flip sound so the UI remains functional.

## What this is

This project aims to feel like a real physical wall calendar:

- A calendar page “hanging” on a wall (nail + string + spiral binding)
- A hero photo per month
- A paper-like page with depth and shadows
- Page flip animation when navigating months

## Features

### Month navigation (page flip + sound)
- Previous/Next month navigation with a page flip animation
- A page flip sound on each flip

### Date range selection
- Click a start date, then click an end date
- Hover preview while picking the end date
- Clear visual states for start/end/in-range

### Notes (persisted in localStorage)
- Monthly note (keyed by `yyyy-MM`)
- Range note attached to a selected date range
- “Recent” list to quickly re-select saved ranges

### Optional: lock past dates
- Toggle **Past: Locked/Open** to prevent selecting dates before today

### Keyboard support
Focus the grid and use:
- Arrow keys to move focus
- Enter / Space to select
- Esc to cancel hover preview

### Hero-tinted room
The wall background subtly tints based on the current month’s hero image so each page feels cohesive.

## Tech stack
- React + TypeScript (Vite)
- Tailwind CSS
- Framer Motion
- date-fns

## Code map
- `src/components/calendar/`
  - `HangingCalendar.tsx`: scene, controls, page flip
  - `CalendarPage.tsx`: page composition (binding + hero + grid)
  - `HeroSection.tsx`: month hero image
  - `CalendarGrid.tsx`: grid + range interactions
  - `NotesPanel.tsx`: monthly + range notes UI
  - `SpiralBinding.tsx`: binding visuals
  - `WallCanvas.tsx`: animated wall backdrop
- `src/hooks/`
  - `useRangeSelection.ts`: range + hover preview logic
  - `useLocalStorageState.ts`: localStorage state helper
  - `useHeroTheme.ts`: derives theme variables from the hero image
- `usePageFlipAudio.ts`: plays `page-flip-47177.mp3` with fallback audio
- `useFlipSound.ts`: fallback synthesized flip via Web Audio

## Scripts
- `npm run dev`: start dev server
- `npm run build`: production build
- `npm run preview`: preview production build
- `npm run lint`: lint
