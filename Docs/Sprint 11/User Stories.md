# Sprint 11 — Leaderboard: Show All Players Always

**Goal:** Every player appears on the leaderboard from the moment they join — not only after buzzing successfully.

**Total Points:** 7

---

## Day 1 — Backend Fix

### [HUROF-BACK-001] Register All Players in Leaderboard on Join
**3 pts · Backend**

> As the **system**, I want every player to be added to the leaderboard the moment they join a session, so that the leaderboard reflects all participants regardless of buzzer activity.

**Acceptance Criteria:**
- [ ] When a player calls `JoinAsPlayer`, a leaderboard entry is created for them with `CorrectAnswersCount = 0`, `ActiveStreak = 0`, `LongestStreak = 0`
- [ ] A `LeaderboardUpdated` SignalR broadcast fires immediately after the new player is seeded
- [ ] Players who never buzz appear at the bottom of the leaderboard (sorted by score desc, then name asc as tiebreaker)
- [ ] If the same player name re-joins (reconnect), their existing stats are preserved — no reset
- [ ] Renaming a player (`RenamePlayerAsync`) migrates the 0-stat entry correctly

**Technical Notes:**
- Add `EnsurePlayerAsync(roomCode, playerName)` to `ILeaderboardService` and `LeaderboardService`
- Call it in `GameHub` after `PlayerTrackerService` registers the player on join
- Add `ThenBy(p => p.PlayerName)` as final sort tiebreaker for stable zero-stat ordering

**Edge Cases:**
- Reconnect with same name → preserve stats, no reset
- Join after game ended → skip broadcast (session inactive)

---

## Day 2 — Frontend Verification

### [HUROF-TV-001] TV Leaderboard Displays Zero-Score Players
**2 pts · TV Display**

> As a **TV Display viewer**, I want to see all joined players on the leaderboard from the start of the game, so that the audience can identify every participant even before buzzing begins.

**Acceptance Criteria:**
- [ ] `LeaderboardPanel` renders entries with `CorrectAnswersCount = 0` without visual breakage
- [ ] Zero-score players show `0` for score, no streak fire emoji
- [ ] Leaderboard is scrollable inside its container when more than ~6 players are listed
- [ ] Rank numbers (Arabic numerals ١، ٢، ٣...) are correct for all entries
- [ ] No gold/silver/bronze badge applies to zero-score entries below rank 3

**Technical Notes:**
- Verify `LeaderboardPanel` container has `overflow-y: auto`
- RTL layout correct with 8+ players
- ⚠️ Assumption: rank badges are positional (1st/2nd/3rd), not score-based

---

### [HUROF-PLAY-001] End-Game Overlay Shows All Players
**2 pts · Player**

> As a **Player**, I want the end-game leaderboard to list every participant (including those who never buzzed), so that the final results screen is a complete record of who played.

**Acceptance Criteria:**
- [ ] `GameEndLeaderboardOverlay` renders players with 0 correct answers
- [ ] Zero-score players are visible (not hidden)
- [ ] Scrolling works on small mobile screens
- [ ] Arabic player names render correctly at all list lengths

**Technical Notes:**
- No data-fetching change needed — overlay consumes `GameOver.leaderboard` array
- Ensure `overflow-y: auto` with `max-height` on the overlay container
- RTL direction must be explicit on the overlay container

---

## Justification

| Day | Stories | Rationale |
|-----|---------|-----------|
| Day 1 | HUROF-BACK-001 | Core backend fix first — frontend work is blocked until the server sends all players |
| Day 2 | HUROF-TV-001, HUROF-PLAY-001 | Both are frontend verification tasks; parallelizable once backend is done |
