import mysql from "mysql2/promise"

const REQUIRED_ENV = [
  "TIDB_HOST",
  "TIDB_USER",
  "TIDB_PASSWORD",
  "TIDB_DATABASE",
] as const

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required env var ${key}. Copy server/.env.example to server/.env and fill in your TiDB Cloud credentials before starting the server.`,
    )
  }
}

export const pool = mysql.createPool({
  host: process.env.TIDB_HOST,
  port: Number(process.env.TIDB_PORT ?? 4000),
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
})
