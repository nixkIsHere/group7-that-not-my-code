import "dotenv/config"
import http from "node:http"
import express from "express"
import cors from "cors"
import { Server } from "socket.io"
import { registerSocketHandlers } from "./socket/handlers"

const PORT = Number(process.env.PORT ?? 4000)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:8443"

const app = express()
app.use(cors({ origin: CLIENT_ORIGIN }))
app.get("/health", (_req, res) => res.json({ ok: true }))

const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN },
})

registerSocketHandlers(io)

httpServer.listen(PORT, () => {
  console.log(
    `[server] "That's Not My Code!" backend listening on :${PORT} (CLIENT_ORIGIN=${CLIENT_ORIGIN})`,
  )
})
