# server — Node.js + Socket.io backend

Real-time multiplayer backend for **"That's Not My Code!"**. Holds the 10 PDPA
case studies and the leaderboard in TiDB, runs the timed round + scoring
server-side (so clients can't fake their score), and pushes live lobby /
leaderboard updates to every connected player over Socket.IO.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Get TiDB Cloud credentials.** Create a free TiDB Cloud Serverless
   cluster at https://tidbcloud.com, then in the console go to
   **Connect → Node.js / General** and copy the host, port (usually `4000`),
   user, and password.

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in `TIDB_HOST`, `TIDB_USER`, `TIDB_PASSWORD`, `TIDB_DATABASE`. Leave
   `PORT` and `CLIENT_ORIGIN` as-is unless you changed the frontend's dev
   port (`AGENTS.md` says the frontend runs on `8443` by default).

4. **Create the schema** (run once against your TiDB database):

   ```bash
   mysql --comments -h <TIDB_HOST> -P 4000 -u <TIDB_USER> -p <TIDB_DATABASE> < src/db/schema.sql
   ```

   (Or paste the contents of `src/db/schema.sql` into the TiDB Cloud SQL
   console.)

5. **Seed the 10 scenarios:**

   ```bash
   npm run seed
   ```

6. **Run the server:**

   ```bash
   npm run dev
   ```

   It listens on `http://localhost:4000` and will refuse to start with a
   clear error if any `TIDB_*` env var is missing.

## What's in TiDB vs. in memory

- **TiDB** (`scenarios`, `leaderboard_entries`): durable data — the case
  study bank, and one row per player per completed round.
- **In-memory** (`src/game/lobby.ts`, `src/game/round.ts`): who's currently
  connected, their live in-round score, and the active question sequence.
  This is intentionally transient — it resets if the server restarts, and
  is written to `leaderboard_entries` once a player finishes their round.

## Socket events

`lobby:join` joins the single shared room while it is waiting. The first
player is the host; if they leave, the earliest remaining arrival becomes host.
`lobby:ready` accepts `{ ready: true }` or `{ ready: false }`. Repeated requests
set the same value rather than toggling it. Legacy requests without a payload
mean ready. Readiness is stored on the server and never starts a round itself.

`lobby:update` broadcasts `{ players, hostId, status, readyCount, allReady }`.
The agreed rule is that every member, including the host, must be ready before
the host can start. There is no fixed player count or automatic start. The room
model supports `waiting`, `starting`, `playing`, and `finished`; joining and
changing readiness are allowed only while waiting. An empty room resets itself.

`lobby:join` acknowledges `{ ok, message? }`, so a rejected join stays on the
home screen. `lobby:start` is host-only and checks all members' readiness on
the server. It locks the room before loading one shared question sequence,
then broadcasts `lobby:countdown` with a `startsAt` timestamp. After three
seconds, every member receives `round:start` and the same first question.
Players then advance at their own pace through that shared sequence.

`lobby:leave` and disconnect remove membership and cancel that player's timers.
A departure while loading/counting down cancels the start and resets readiness.
Question-loading failures also reopen the room for a retry. Once all remaining
players finish or leave, the room reopens with scores and readiness reset.
The review screen keeps its completed-round results. Returning home leaves
the room; a disconnected player must explicitly rejoin.

Run the room behavior tests with Node 22.18+ from `server/`:

```bash
node --import tsx --test tests/lobby.test.mts tests/multiplayer.test.mts
```

The multiplayer tests use real local Socket.IO clients, shortened countdowns,
and injected database functions; they do not write to TiDB. Install root and
server dependencies first (the tests use the frontend's Socket.IO client).
