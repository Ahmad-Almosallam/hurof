# Sprint 8 — Bug Fixes & UX Polish

## Overview

Three targeted fixes: a backend leaderboard tracking bug (always-zero counts), a TV Display buzz overlay that clips its content, and a Host Dashboard letter-selection flow that jumps abruptly.

---

**[HUROF-TV-003] Redesign BuzzBanner as a Clean Non-Splitting Overlay on TV Display**

> As a **TV Display viewer**, I want the buzz notification to appear as a clear, non-intrusive overlay, so that I can read who buzzed without the grid becoming obscured or the content appearing clipped.

**Acceptance Criteria:**
- [ ] BuzzBanner renders as a fixed overlay that never splits or clips its own content
- [ ] The hex grid remains fully visible behind the banner at all times
- [ ] Banner content (player name, timer if active) is always fully readable — no cut-off text
- [ ] Banner position and size does not cause any layout shift to surrounding elements
- [ ] RTL — player name renders correctly right-to-left

**Story Points:** `3`

**Technical Notes:**
- Current file: `hurof-client/src/components/ui/BuzzBanner.tsx`
- Use `frontend-design` skill to redesign — compact, cinematically styled toast/strip native to the dark theme
- Must not interfere with the leaderboard sidebar added in Sprint 7

**Edge Cases & Error States:**
- Long Arabic player name — must truncate or wrap without breaking layout
- Timer active simultaneously — both must be readable within the same banner

---

**[HUROF-HOST-002] Smooth Letter-Selection UX on Host Dashboard**

> As a **Host**, I want clicking a letter to reveal the question panel smoothly without the grid disappearing or the screen jumping, so that I can maintain situational awareness of the board while reading the question.

**Acceptance Criteria:**
- [ ] The hex grid remains visible at all times after a letter is clicked — it does not collapse, hide, or scroll out of view
- [ ] The question panel animates into view (slide or fade) rather than appearing instantly
- [ ] The loading state for the question does not collapse or unmount the question panel area — a skeleton/spinner appears in-place
- [ ] Dismissing/deactivating a letter animates the panel out smoothly
- [ ] RTL layout preserved throughout the transition

**Story Points:** `5`

**Technical Notes:**
- Current file: `hurof-client/src/pages/host/HostDashboard.tsx`
- Use `frontend-design` skill — persistent side panel or bottom drawer, always mounted, transitions between empty/loading/populated states
- Avoid `display: none` toggles that cause layout reflow; use opacity + transform transitions

**Edge Cases & Error States:**
- Question fetch fails — error shown in-place, grid stays visible
- Host clicks different letter while panel animating — panel updates without flicker

---

**[HUROF-BACK-002] Fix Streak and Correct Answer Count Always Showing Zero**

> As the **system**, I want correct answer counts and streaks to be tracked accurately, so that the leaderboard reflects real player performance.

**Acceptance Criteria:**
- [ ] Correct answers count increments by 1 each time a letter is assigned to a team for the player who buzzed in
- [ ] Active streak increments correctly on consecutive correct answers
- [ ] Streak only resets when the buzzer is cleared for a wrong answer — not after a correct assignment
- [ ] If no player buzzed when a letter is assigned, no count is recorded
- [ ] Leaderboard broadcast reflects updated counts immediately after each correct answer

**Story Points:** `3`

**Technical Notes:**
- Root cause: host may reset buzzer *before* assigning letter → `BuzzerLockedByPlayer` is null when `LetterService` checks it → count never recorded
- Also: `BuzzerService.ResetAsync` fires after a correct answer and resets streak
- Fix: `LeaderboardService` owns a "current contender" per room. Set on buzz (`SetCurrentContender`), consumed on correct answer (`RecordCorrectAnswerForContender`), cleared on reset (`RecordStreakResetForContender` — only fires if not already consumed)

**Edge Cases & Error States:**
- Host assigns letter with no buzz — contender null, nothing tracked
- Buzzer reset after correct answer already recorded — contender already cleared, no double reset

---

## Summary

| Story ID | Title | Points | Role |
|----------|-------|--------|------|
| HUROF-TV-003 | Redesign BuzzBanner as Clean Non-Splitting Overlay | 3 | TV Display |
| HUROF-HOST-002 | Smooth Letter-Selection UX on Host Dashboard | 5 | Host |
| HUROF-BACK-002 | Fix Streak and Correct Answer Count Always Zero | 3 | Backend |
| **Total** | | **11 pts** | |
