# Sprint 10 — Game End Screen Improvements

**Theme:** Polish the game-end experience — team winner visibility and player navigation.

---

## Day 1 — Frontend only (5 pts)

Both stories touch `GameEndLeaderboardOverlay` and the pages that render it. Tackle them together in one session.

### HUROF-GAME-001 — Show team winner on game-end leaderboard overlay (3 pts)

> As a **player/TV viewer**, I want to see which team won displayed prominently on the end-game screen, so that the team victory is celebrated alongside individual scores.

**Acceptance Criteria:**
- [ ] When `winnerTeam` is 1 or 2, a team winner banner appears above the leaderboard table
- [ ] Banner shows "فريق ١" or "فريق ٢" in the team's color
- [ ] When `winnerTeam` is null, no team banner is shown
- [ ] Visible and readable on Player phone (small viewport)
- [ ] Visible and readable on TV Display (large viewport)
- [ ] RTL layout preserved

**Technical Notes:**
- Add `winnerTeam?: number | null`, `team1Color?: string`, `team2Color?: string` to `GameEndLeaderboardOverlay` props
- Both `PlayerBuzzerPage` and `TvDisplayPage` have `gameOver.winnerTeam` and `session.team1Color/team2Color` — just pass them through
- Style reference: `GameOverBanner` winner label logic

---

### HUROF-PLAY-002 — Home button on player end-screen (2 pts)

> As a **player**, I want a button to go back to the home screen after the game ends, so I'm not stuck on the leaderboard with no way out.

**Acceptance Criteria:**
- [ ] "الرئيسية" button appears at the bottom of `GameEndLeaderboardOverlay` for Player view
- [ ] Tapping navigates to `/`
- [ ] Button is in thumb reach on mobile (fixed/sticky bottom)
- [ ] Button does NOT appear on TV Display
- [ ] Visible even when leaderboard list is long

**Technical Notes:**
- Add `onHome?: () => void` prop to `GameEndLeaderboardOverlay`
- `PlayerBuzzerPage` passes `onHome={() => navigate('/')}`, `TvDisplayPage` omits it
- Render button only when `onHome` is defined

---

## Summary

| Story ID | Title | Points | Role |
|---|---|---|---|
| HUROF-GAME-001 | Team winner on end-screen overlay | 3 | Player + TV |
| HUROF-PLAY-002 | Home button on player end-screen | 2 | Player |
| **Total** | | **5 pts** | |
