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
  [free-exercise-db](https://github.com/yuhonas/free-exercise-db) dataset.
- Pilates moves embed one short YouTube tutorial each (`src/lib/pilates-videos.ts`,
  privacy-enhanced embed, loads only when the how-to is opened). Ids were checked
  embeddable via oEmbed; if one goes dark, swap the id there.
- `src/app/page.tsx` — setup + weekly plan.
- `src/app/workout/page.tsx` — the workout player.

## Shared accounts

Residents join with the **building code** (you set it), a **nickname** and a
**4-digit pin**. No email. The pin only stops a neighbour logging sessions as
you: it's scrypt-hashed and five wrong tries lock the name for 15 minutes.
Signed-in phones hydrate from the server on load and push every finished
session; if the gym has no signal the write queues and retries next time.
The building view is anonymous by design: "the gym right now" (barely anyone /
getting busier / busy, from members who started a workout in the last 90 min)
and a count of how many neighbours trained this week. Never names.

```bash
cp .env.example .env.local   # DATABASE_URL + BUILDING_CODES
createdb apt_gym_dev          # schema is created on first request
```

- `src/lib/db.ts` — pg pool + schema (members, profiles, sessions).
- `src/lib/auth.ts` — join / sign in, pin hashing, lockout, cookie.
- `src/lib/sync.ts` — client side: hydrate, push, offline queue.
- `src/app/api/*` — join, me, profile, sessions, logout.

## Deliberate limits

- Reminders use the phone's calendar instead of push, so no push server is needed.
- No password reset: a forgotten pin means a new nickname (or an admin `update`).
- One building code per deployment is plenty; the env var takes several if needed.
