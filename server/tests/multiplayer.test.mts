import assert from "node:assert/strict"
import { test } from "node:test"
import { createServer } from "node:http"
import { Server } from "socket.io"
import {
  io as connect,
  type Socket,
} from "../../node_modules/socket.io-client/build/esm/index.js"
import type { Scenario } from "../src/types.ts"
import * as lobby from "../src/game/lobby.ts"

// All persistence below is injected; tests never access the real database.
for (const key of ["TIDB_HOST", "TIDB_USER", "TIDB_PASSWORD", "TIDB_DATABASE"])
  process.env[key] = "test-only"
const { createRoundManager } = await import("../src/game/round.ts")
const { registerSocketHandlers } = await import("../src/socket/handlers.ts")
const scenario: Scenario = {
  id: 1,
  type: "backend",
  titleEn: "Test",
  titleTh: "ทดสอบ",
  code: "test",
  answer: "comply",
  contextEn: "Test",
  contextTh: "ทดสอบ",
  hintEn: "",
  hintTh: "",
  explanationEn: "Test",
  explanationTh: "ทดสอบ",
  pdpaRef: "test",
}
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
function event(
  socket: Socket,
  name: string,
  predicate: (value: any) => boolean = () => true,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(name, listener)
      reject(new Error(`Timed out: ${name}`))
    }, 4000)
    function listener(value: any) {
      if (!predicate(value)) return
      clearTimeout(timer)
      socket.off(name, listener)
      resolve(value)
    }
    socket.on(name, listener)
  })
}

async function setup(load = async () => [scenario], countdownMs = 50) {
  for (const p of lobby.getRoster()) lobby.removePlayer(p.id)
  const http = createServer()
  const io = new Server(http)
  const saved: any[] = []
  const answers: any[] = []
  let loads = 0
  const game = createRoundManager(
    {
      pickRandomTen: async () => {
        loads++
        return load()
      },
      insertResult: async (entry) => {
        saved.push(entry)
      },
      logAnswer: async (entry) => {
        answers.push(entry)
      },
    },
    countdownMs,
  )
  registerSocketHandlers(io, game)
  await new Promise<void>((resolve) => http.listen(0, "127.0.0.1", resolve))
  const address = http.address() as { port: number }
  const clients: Socket[] = []
  async function client() {
    const socket = connect(`http://127.0.0.1:${address.port}`, {
      transports: ["websocket"],
      forceNew: true,
      reconnection: false,
    })
    clients.push(socket)
    await event(socket, "connect")
    return socket
  }
  async function join(socket: Socket, alias: string) {
    return socket.timeout(2000).emitWithAck("lobby:join", { alias })
  }
  async function ready(socket: Socket, value = true) {
    const updated = event(
      socket,
      "lobby:update",
      (s) => s.players.find((p: any) => p.id === socket.id)?.ready === value,
    )
    socket.emit("lobby:ready", { ready: value })
    await updated
  }
  async function close() {
    clients.forEach((socket) => socket.disconnect())
    await new Promise<void>((resolve) => io.close(() => resolve()))
  }
  return { client, join, ready, close, saved, answers, loads: () => loads }
}

test("two players share one start; server rejects unauthorized, premature and duplicate starts; a second round resets readiness", async () => {
  const h = await setup()
  try {
    const a = await h.client()
    const b = await h.client()
    const c = await h.client()
    await h.join(a, "A")
    await h.join(b, "B")
    let denied = event(a, "server:error")
    a.emit("lobby:start")
    await denied
    await h.ready(a)
    await h.ready(b)
    assert.equal(lobby.getSnapshot().status, "waiting")
    denied = event(b, "server:error")
    b.emit("lobby:start")
    await denied
    const firstA = event(a, "round:scenario")
    const firstB = event(b, "round:scenario")
    const countdown = event(a, "lobby:countdown")
    let startCount = 0
    a.on("round:start", () => startCount++)
    a.emit("lobby:start")
    a.emit("lobby:start")
    await countdown
    assert.equal((await h.join(c, "late")).ok, false)
    const [qa, qb] = await Promise.all([firstA, firstB])
    assert.deepEqual(qa, qb)
    assert.equal("answer" in qa.scenario, false)
    assert.equal(h.loads(), 1)
    assert.equal(startCount, 1)
    assert.equal((await h.join(c, "late")).ok, false)
    const endA = event(a, "round:end")
    a.emit("round:answer", { scenarioId: 1, verdict: "comply" })
    a.emit("round:answer", { scenarioId: 1, verdict: "comply" })
    await endA
    assert.equal(lobby.getSnapshot().status, "playing")
    const endB = event(b, "round:end")
    const waiting = event(b, "lobby:update", (s) => s.status === "waiting")
    b.emit("round:answer", { scenarioId: 1, verdict: "comply" })
    await endB
    await waiting
    assert.equal(h.saved.length, 2)
    assert.equal(h.answers.length, 2)
    assert.equal(lobby.getSnapshot().readyCount, 0)
    await h.ready(a)
    await h.ready(b)
    const again = event(a, "round:scenario")
    a.emit("lobby:start")
    await again
    assert.equal(startCount, 2)
    assert.equal(h.loads(), 2)
    const transferred = event(b, "lobby:update", (s) => s.hostId === b.id)
    a.disconnect()
    await transferred
    const empty = event(c, "lobby:update", (s) => s.players.length === 0)
    b.emit("lobby:leave")
    await empty
    assert.equal(lobby.getSnapshot().status, "waiting")
  } finally {
    await h.close()
  }
})

test("departure during question loading cancels stale start and transfers host", async () => {
  let resolveLoad: (questions: Scenario[]) => void
  const h = await setup(
    () =>
      new Promise((resolve) => {
        resolveLoad = resolve
      }),
  )
  try {
    const a = await h.client()
    const b = await h.client()
    await h.join(a, "A")
    await h.join(b, "B")
    await h.ready(a)
    await h.ready(b)
    const starting = event(b, "lobby:update", (s) => s.status === "starting")
    a.emit("lobby:start")
    await starting
    const waiting = event(
      b,
      "lobby:update",
      (s) => s.hostId === b.id && s.status === "waiting",
    )
    a.emit("lobby:leave")
    await waiting
    resolveLoad([scenario])
    await delay(100)
    assert.equal(lobby.getSnapshot().status, "waiting")
    assert.equal(lobby.getSnapshot().readyCount, 0)
  } finally {
    await h.close()
  }
})

test("departure during countdown cancels the timer and allows a fresh start", async () => {
  const h = await setup(undefined, 100)
  try {
    const a = await h.client()
    const b = await h.client()
    await h.join(a, "A")
    await h.join(b, "B")
    await h.ready(a)
    await h.ready(b)
    const countdown = event(a, "lobby:countdown")
    a.emit("lobby:start")
    await countdown
    const waiting = event(a, "lobby:update", (s) => s.status === "waiting")
    b.disconnect()
    await waiting
    await delay(150)
    assert.equal(lobby.getSnapshot().status, "waiting")
    await h.ready(a)
    const first = event(a, "round:scenario")
    a.emit("lobby:start")
    await first
    assert.equal(lobby.getSnapshot().status, "playing")
  } finally {
    await h.close()
  }
})

test("empty question bank recovers without leaving the room locked", async () => {
  const h = await setup(async () => [])
  try {
    const a = await h.client()
    await h.join(a, "A")
    await h.ready(a)
    const error = event(a, "server:error")
    a.emit("lobby:start")
    await error
    assert.equal(lobby.getSnapshot().status, "waiting")
    assert.equal(lobby.getSnapshot().readyCount, 0)
  } finally {
    await h.close()
  }
})
