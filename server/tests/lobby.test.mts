import assert from "node:assert/strict"
import { beforeEach, test } from "node:test"
import * as lobby from "../src/game/lobby.ts"

beforeEach(() => {
  for (const p of lobby.getRoster()) lobby.removePlayer(p.id)
})

test("empty rooms cannot start; first arrival is host even after scores change", () => {
  assert.equal(lobby.getSnapshot().allReady, false)
  assert.equal(lobby.beginStarting("unknown"), false)
  lobby.addPlayer("a", "A")
  lobby.addPlayer("b", "B")
  lobby.updateScore("b", 100, 1)
  assert.equal(lobby.getSnapshot().hostId, "a")
  assert.equal(lobby.setReady("unknown", true), false)
})

test("ready is idempotent, reversible and never starts the room", () => {
  lobby.addPlayer("a", "A")
  lobby.addPlayer("b", "B")
  lobby.setReady("a", true)
  lobby.setReady("a", true)
  assert.equal(lobby.getSnapshot().readyCount, 1)
  assert.equal(lobby.beginStarting("a"), false)
  lobby.setReady("b", true)
  assert.equal(lobby.getSnapshot().allReady, true)
  assert.equal(lobby.getSnapshot().status, "waiting")
  lobby.setReady("a", false)
  assert.equal(lobby.getSnapshot().allReady, false)
})

test("only the ready host can reserve a round; locked rooms reject joins and ready changes", () => {
  lobby.addPlayer("a", "A")
  lobby.addPlayer("b", "B")
  lobby.setReady("a", true)
  lobby.setReady("b", true)
  assert.equal(lobby.beginStarting("b"), false)
  assert.equal(lobby.beginStarting("a"), true)
  assert.equal(lobby.beginStarting("a"), false)
  for (const advance of [
    () => {},
    () => lobby.markPlaying(),
    () => lobby.markFinished(),
  ]) {
    advance()
    assert.equal(lobby.addPlayer("c", "C"), false)
    assert.equal(lobby.setReady("a", false), false)
  }
  assert.equal(lobby.reopen(), true)
  assert.equal(lobby.getSnapshot().readyCount, 0)
  assert.equal(lobby.addPlayer("c", "C"), true)
})

test("host transfers by arrival order and the last departure resets a locked room", () => {
  for (const id of ["a", "b", "c"]) {
    lobby.addPlayer(id, id)
    lobby.setReady(id, true)
  }
  lobby.updateScore("c", 100, 1)
  lobby.beginStarting("a")
  lobby.removePlayer("a")
  assert.equal(lobby.getSnapshot().hostId, "b")
  lobby.removePlayer("b")
  lobby.removePlayer("c")
  assert.equal(lobby.getSnapshot().hostId, null)
  assert.equal(lobby.getSnapshot().status, "waiting")
  assert.equal(lobby.addPlayer("d", "D"), true)
  assert.equal(lobby.getSnapshot().hostId, "d")
})

test("failed starts can reopen, invalid transitions are rejected, snapshots cannot mutate readiness", () => {
  lobby.addPlayer("a", "A")
  assert.equal(lobby.markPlaying(), false)
  assert.equal(lobby.markFinished(), false)
  lobby.getSnapshot().players[0].ready = true
  assert.equal(lobby.getSnapshot().allReady, false)
  lobby.setReady("a", true)
  lobby.beginStarting("a")
  assert.equal(lobby.reopen(), true)
  assert.equal(lobby.getSnapshot().readyCount, 0)
  assert.equal(lobby.beginStarting("a"), false)
})
