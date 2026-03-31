# Sprint 3 — UX Polish & Live-Event Reliability

> Source: UX Research audit (2026-03-31). All issues traced to specific components.

---

## Feature 1: Host Cell Management Safety

**US-3.1** As a host, when I accidentally click an already-active cell I want it to deactivate
          (return to Unselected) so I can recover from a mis-tap without being forced to
          assign it to a team.

**US-3.2** As a host, when I click a cell that is already assigned to a team a confirmation
          dialog appears before it reverts to Unselected, so one mis-tap during a tense
          moment cannot silently erase a correct assignment.

---

## Feature 2: Buzzer Button — Reliability & Feedback

**US-3.3** As a player, the moment I tap the buzzer button I see immediate visual feedback
          (slight dim + scale) while the network call is in-flight, so I know my tap
          registered and I don't panic-tap again.

**US-3.4** As a player who wins the buzz race, my phone vibrates with a celebratory double-
          pulse (distinct from the press vibration) the moment the "أنت أول!" state arrives.

**US-3.5** As a player who loses the buzz race, the buzzer button shows "سبقك!" as the
          primary label and the winner's name as a smaller subtitle — not the winner's name
          alone as the button text.

**US-3.6** As a player in the waiting state, I see a subtitle under "انتظر..." that reads
          "انتظر اختيار الحرف" so I understand the game phase and don't think the app froze.

---

## Feature 3: TV Display Safety & Clarity

**US-3.7** As a TV viewer on a projector, the "← رجوع" button is removed from the display
          so no accidental tap or nearby touch can navigate away from the game.

**US-3.8** As a TV viewer, when the WebSocket connection drops a full-screen pulsing banner
          reading "جارٍ إعادة الاتصال..." appears over the display so the audience and host
          immediately know the feed is interrupted — instead of a tiny dot nobody can see.

**US-3.9** As a TV viewer, the hex grid remains partially visible (grid shown in lower
          portion) while the BuzzBanner is displayed, so the audience can still see which
          letter cell is in play.

---

## Feature 4: Answer Visibility Control

**US-3.10** As a host, the question answer is hidden by default in the QuestionCard and
           TimerExpiredDialog and revealed only when I tap "اكشف الجواب", so I can't
           accidentally expose the answer to nearby players or a side-monitor.

---

## Feature 5: Timer Labels & Phase Clarity

**US-3.11** As a host and TV viewer, the Phase 1 timer label reads "وقت الضغط" (buzz time)
           instead of "وقت الطارئ", and Phase 2 reads "وقت التفكير" (thinking time) instead
           of "وقت الفريق", making the phase purpose immediately clear.

**US-3.12** As a host, the TimerExpiredDialog action button for Phase 2 reads
           "ابدأ وقت التفكير ⏱" instead of "ابدأ وقت الفريق الآخر" so I know exactly
           what happens when I tap it.

---

## Feature 6: Minor UI Polish

**US-3.13** As a player, the "تغيير الاسم" and "الخروج من اللعبة" buttons are visible enough
           to tap (opacity ≥ 0.65) while remaining unobtrusive during active play.

**US-3.14** As a host, the QuestionCard and sidebar tabs are shown side-by-side on desktop
           screens (≥ 1024px) so I can see the player list and the active question
           simultaneously without switching tabs.
