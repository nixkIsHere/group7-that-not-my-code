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

See the "Socket event contract" table in the project plan / `src/socket/handlers.ts`
for the full list. In short: `lobby:join` → `lobby:ready` → a private stream
of `round:scenario` / `round:result` per player → `round:end`. `lobby:update`
is broadcast to everyone whenever the roster or any score changes.
