-- Run once against your TiDB Cloud database before starting the server:
--   mysql --comments -h <host> -P 4000 -u <user> -p <database> < schema.sql
-- (or paste it into the TiDB Cloud SQL console)

CREATE TABLE IF NOT EXISTS scenarios (
  id INT PRIMARY KEY,
  type ENUM('backend', 'frontend') NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_th VARCHAR(255) NOT NULL,
  code TEXT NOT NULL,
  answer ENUM('comply', 'violate') NOT NULL,
  context_en TEXT NOT NULL,
  context_th TEXT NOT NULL,
  hint_en TEXT NOT NULL,
  hint_th TEXT NOT NULL,
  explanation_en TEXT NOT NULL,
  explanation_th TEXT NOT NULL,
  pdpa_ref VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  alias VARCHAR(20) NOT NULL,
  score INT NOT NULL,
  correct_count INT NOT NULL,
  stun_count INT NOT NULL,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_leaderboard_score (score DESC)
);

-- Raw per-question response log — one row per answer, keyed only by the
-- alias the player typed in (no login, no round/session grouping; think
-- Google Forms responses). Not summarized anywhere yet; query this
-- directly later for per-scenario stats.
CREATE TABLE IF NOT EXISTS answer_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  alias VARCHAR(20) NOT NULL,
  scenario_id INT NOT NULL,
  given ENUM('comply', 'violate') NOT NULL,
  correct BOOLEAN NOT NULL,
  time_ms INT NOT NULL,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_answer_log_scenario (scenario_id),
  INDEX idx_answer_log_alias (alias)
);
