# Sprint 7 — Leaderboard & Streak Tracking

## Overview

This sprint introduces a live leaderboard with streak tracking across all views. Players' correct answer counts and consecutive streaks are tracked in real-time, displayed on the TV Display throughout the game, and revealed in full to all players at game end.

---

**[HUROF-BACK-001] Track Correct Answers and Active Streak Per Player**

> As the **system**, I want to track each player's correct answer count and active streak within a session, so that the leaderboard always reflects live standings.

**Acceptance Criteria:**
- [ ] Each player in a session has: `correctAnswersCount`, `activeStreak`, `longestStreak`
- [ ] When a player answers correctly: `correctAnswersCount++`, `activeStreak++`
- [ ] If the new `activeStreak` exceeds `longestStreak`, update `longestStreak`
- [ ] When a player's buzzer is reset without a correct answer, `activeStreak` resets to `0`; `longestStreak` is not changed
- [ ] `longestStreak` persists even after `activeStreak` resets
- [ ] Leaderboard is sorted: primary by `correctAnswersCount DESC`, tiebreaker by `longestStreak DESC`
- [ ] After every correct answer or streak reset, the backend broadcasts an updated leaderboard snapshot

**Story Points:** `3`

**Technical Notes:**
- Add `CorrectAnswersCount`, `ActiveStreak`, `LongestStreak` fields to `SessionPlayer` entity (or equivalent in-memory model)
- Broadcast `LeaderboardUpdated` SignalR event with the full sorted leaderboard after every mutation
- Streak reset is triggered by the same action that resets the buzzer (Host explicitly resets after wrong answer)

**Edge Cases & Error States:**
- Player disconnects mid-streak — streak freezes at current value; `longestStreak` preserved; `activeStreak` treated as broken when they reconnect
- ⚠️ Assumption: Host reassigning a letter does not retroactively change streaks — streaks are based on buzzer events, not letter state

---

**[HUROF-TV-001] Always-Visible Live Leaderboard on TV Display**

> As a **TV Display viewer**, I want to see a live leaderboard panel at all times during the game, so that the audience can track standings without interrupting the game flow.

**Acceptance Criteria:**
- [ ] A leaderboard panel is permanently visible on the TV Display during an active game session
- [ ] Panel shows each player's name, correct answer count, and active streak (if `activeStreak >= 1`)
- [ ] Leaderboard rows update in real-time when `LeaderboardUpdated` is received via SignalR
- [ ] Players are listed in rank order (rank 1 at top)
- [ ] If a player has an active streak ≥ 1, a streak indicator (e.g. flame icon + streak count) appears next to their name
- [ ] When a player's active streak resets to 0, the streak indicator disappears immediately
- [ ] Panel is RTL-compatible (Arabic names right-aligned, rank number and streak indicator positioned correctly)

**Story Points:** `5`

**Technical Notes:**
- Use `frontend-design` skill for streak indicator styling — flame/streak badge should use high-contrast, visually prominent treatment consistent with the cinematic dark theme
- Subscribe to `LeaderboardUpdated` SignalR event; update local leaderboard state on receipt
- Animate row re-ordering when rankings change (slide transition, not instant jump)
- Streak indicator renders only when `activeStreak >= 1`
- Panel should be a fixed sidebar or bottom strip — must not overlay the hex grid

**Edge Cases & Error States:**
- Two players tied on `correctAnswersCount` and `longestStreak` — display in join order, no visual distinction needed
- Leaderboard at game start (no correct answers yet) — show all players with 0, no streak indicators

---

**[HUROF-TV-002] Game-End Full Leaderboard on TV Display**

> As a **TV Display viewer**, I want to see a full final leaderboard overlay when the game ends, so that the audience can celebrate the winner and see complete standings.

**Acceptance Criteria:**
- [ ] When the game ends, a full-screen (or prominent overlay) leaderboard replaces or overlays the hex grid on TV Display
- [ ] Final leaderboard shows: rank, player name, correct answers, active streak at time of win, and **longest streak saved**
- [ ] Rank 1 is visually highlighted (e.g. gold/crown treatment)
- [ ] `longestStreak` column is explicitly labeled and shown for all players, not just the winner
- [ ] Overlay is triggered by receiving `GameOver` or a new `GameEndLeaderboard` SignalR event
- [ ] Leaderboard sorted by `correctAnswersCount DESC`, tiebreaker `longestStreak DESC`
- [ ] RTL layout — Arabic text right-aligned, rank numbers left

**Story Points:** `5`

**Technical Notes:**
- Backend should emit `GameEndLeaderboard` event with full final snapshot on game end (piggyback on existing `GameOver` event or add a new payload field)
- Use `frontend-design` skill for end-screen treatment — consider entrance animation (fade-in rows staggered top to bottom), gold/silver/bronze rank coloring
- `longestStreak` column should be visually distinct from the live streak indicator (it is historical, not live)

**Edge Cases & Error States:**
- Game ends with all players at 0 correct answers — leaderboard still shows, all with 0
- Network lag: TV Display misses `GameOver` — should re-request final state on reconnect

---

**[HUROF-PLAY-001] Game-End Leaderboard Shown on Player Buzzer Screens**

> As a **Player**, I want to see the final leaderboard on my phone when the game ends, so that I can immediately see my rank and how my streak compared to others.

**Acceptance Criteria:**
- [ ] When `GameOver` is received, the buzzer screen transitions to a full leaderboard view
- [ ] The player's own row is visually highlighted (e.g. different background color)
- [ ] Each row shows: rank, player name, correct answers, longest streak
- [ ] The viewing player's `longestStreak` is prominently shown
- [ ] A "Game Over" heading is displayed in Arabic (`انتهت اللعبة`)
- [ ] The view is RTL

**Story Points:** `3`

**Technical Notes:**
- Reuse the same `GameEndLeaderboard` event payload from `HUROF-TV-002`
- Highlight the current player's row using their `playerId` matched against session identity
- Read-only view — no interaction required

**Edge Cases & Error States:**
- Player with 0 correct answers — still shown in leaderboard, no streak indicator
- Player rejoined mid-game — stats from before disconnect should be preserved (backend responsibility, see `HUROF-BACK-001`)

---

## Summary

| Story ID | Title | Points | Role |
|----------|-------|--------|------|
| HUROF-BACK-001 | Track Correct Answers and Active Streak Per Player | 3 | Backend |
| HUROF-TV-001 | Always-Visible Live Leaderboard on TV Display | 5 | TV Display |
| HUROF-TV-002 | Game-End Full Leaderboard on TV Display | 5 | TV Display |
| HUROF-PLAY-001 | Game-End Leaderboard Shown on Player Buzzer Screens | 3 | Player |
| **Total** | | **16 pts** | |
