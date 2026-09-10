import { io, type Socket } from "socket.io-client"

import type {
  LobbyUpdatePayload,
  RoundEndPayload,
  RoundResultPayload,
  RoundScenarioPayload,
  RoundStartPayload,
} from "../types"

const URL = import.meta.env.VITE_SERVER_URL || undefined

export interface ServerToClientEvents {
  "lobby:update": (payload: LobbyUpdatePayload) => void
  "lobby:countdown": (payload: { startsAt: number }) => void
  "round:start": (payload: RoundStartPayload) => void

  "round:scenario": (payload: RoundScenarioPayload) => void

  "round:result": (payload: RoundResultPayload) => void

  "round:end": (payload: RoundEndPayload) => void

  "server:error": (payload: { message: string }) => void
}

export interface ClientToServerEvents {
  "lobby:join": (
    payload: { alias: string },
    ack: (result: {
      ok: boolean
      message?: string
    }) => void,
  ) => void
  "lobby:start": () => void
  "lobby:leave": () => void
  "lobby:ready": (payload: { ready: boolean }) => void
  "round:answer": (payload: {
    scenarioId: number

    verdict: "comply" | "violate" | null
  }) => void
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = URL
  ? io(URL, { autoConnect: true })
  : io({ autoConnect: true })
