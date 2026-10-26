# 321gym

Workouts built from the equipment that's actually in our building's gym.
Pick a goal, how long you have, and how many days a week; get a plan that
rotates weekly, with how-to for every exercise, a rest timer, set logging,
progression suggestions, and calendar reminders.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Add to home screen on your phone to use it as an app.

Two ways in: **right now** (pick minutes + focus, go) or **my week** (goal,
days, a rotating plan with reminders). Progress shows sessions, weekly streak
and estimated-1RM strength trends per exercise.

## Where things live

- `src/lib/equipment.ts` — what's in the gym. Flip `available: false` when something breaks.
- `src/lib/exercises.ts` — exercise library: pattern, equipment, how-to, cues.
- `src/lib/generate.ts` — turns goal + minutes + days into sessions.
- `src/lib/store.ts` — localStorage persistence and the progression rule.
- `src/lib/ics.ts` — reminders as a recurring calendar event.
- `src/lib/pilates.ts` — classical mat sequence, two levels.
- `src/lib/evidence.ts` — graded claims + sources behind the numbers (collapsed in the UI).
- `src/lib/progress.ts` — attendance, streaks, strength trends.
- Exercise photos (start/end frames) come from the open
  [free-exercise-db](https://github.com/yuhonas/free-exercise-db) dataset; pilates
  moves don't have photos yet and fall back to a demo link.
- `src/app/page.tsx` — setup + weekly plan.
- `src/app/workout/page.tsx` — the workout player.

## v1 limits (on purpose)

- Data lives on the device. Building code + nickname sharing and a Postgres
  backend are the next slice.
- Reminders use the phone's calendar instead of push, so no server is needed.
- Demo videos are YouTube search links rather than hosted clips.
