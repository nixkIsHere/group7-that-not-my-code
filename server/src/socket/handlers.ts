import type { Server, Socket } from "socket.io"
import * as lobby from "../game/lobby"
import * as round from "../game/round"
import type { Verdict } from "../types"

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    socket.on("lobby:join", (payload: { alias?: string }) => {
      const alias =
        String(payload?.alias ?? "")
          .trim()
          .slice(0, 20) || "player"
      lobby.addPlayer(socket.id, alias)
      io.emit("lobby:update", { players: lobby.getRoster() })
    })

    socket.on("lobby:ready", () => {
      if (!lobby.getPlayer(socket.id)) return // must join before readying up
      lobby.setReady(socket.id, true)
      io.emit("lobby:update", { players: lobby.getRoster() })

      round.startRoundForPlayer(io, socket.id).catch((err) => {
        console.error("[socket] failed to start round:", err)
        socket.emit("server:error", {
          message: "Could not start the round. Please try again.",
        })
      })
    })

    socket.on(
      "round:answer",
      (payload: { scenarioId: number; verdict: Verdict | null }) => {
        round.handleAnswer(
          io,
          socket.id,
          payload?.scenarioId,
          payload?.verdict ?? null,
        )
      },
    )

    socket.on("disconnect", () => {
      round.cancelRound(socket.id)
      lobby.removePlayer(socket.id)
      io.emit("lobby:update", { players: lobby.getRoster() })
    })
  })
}
