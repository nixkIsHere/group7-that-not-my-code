import type { Server, Socket } from "socket.io"

import * as lobby from "../game/lobby"

import * as round from "../game/round"

import type { Verdict } from "../types"

export function registerSocketHandlers(
  io: Server,
  game: Pick<typeof round, "startRoom" | "handleAnswer" | "cancelRound"> = round,
): void {
  io.on("connection", (socket: Socket) => {
    socket.emit("lobby:update", lobby.getSnapshot())
    socket.on(
      "lobby:join",
      (
        payload: { alias?: string },
        ack?: (result: {
          ok: boolean
          message?: string
        }) => void,
      ) => {
        const alias =
          String(payload?.alias ?? "")

            .trim()

            .slice(0, 20) || "player"

        if (!lobby.addPlayer(socket.id, alias)) {
          const message = "The room is locked. Please wait for the next round."
          if (typeof ack === "function") ack({ ok: false, message })
          else socket.emit("server:error", { message })
          return
        }
        io.emit("lobby:update", lobby.getSnapshot())
        if (typeof ack === "function") ack({ ok: true })
      },
    )

    socket.on("lobby:start", () => {
      void game.startRoom(io, socket.id)
    })

    function leave() {
      game.cancelRound(io, socket.id)
      lobby.removePlayer(socket.id)
      io.emit("lobby:update", lobby.getSnapshot())
    }
    socket.on("lobby:leave", leave)

    socket.on("lobby:ready", (payload?: { ready?: unknown }) => {
      // Older clients send no payload; repeated messages remain idempotent.
      const ready = payload === undefined ? true : payload?.ready
      if (typeof ready !== "boolean") return
      if (!lobby.setReady(socket.id, ready)) return
      io.emit("lobby:update", lobby.getSnapshot())
    })

    socket.on(
      "round:answer",

      (payload: {
        scenarioId: number
        verdict: Verdict | null
      }) => {
        if (
          payload?.verdict !== null &&
          payload?.verdict !== "comply" &&
          payload?.verdict !== "violate"
        )
          return
        game.handleAnswer(
          io,

          socket.id,

          payload?.scenarioId,

          payload?.verdict ?? null,
        )
      },
    )

    socket.on("disconnect", leave)
  })
}
