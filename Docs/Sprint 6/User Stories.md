# Sprint 6 — Host Polish, Buzzer Resilience & TV Overflow

> Source: UX Research audit pass 4 (2026-04-01). All issues traced to specific components.

---

## Feature 1: QuestionCard Answer State Reset

**US-6.1** As a host, when I activate a new letter on the hex grid the QuestionCard always
          starts with the answer hidden, so I never accidentally reveal the new question's
          answer the moment the card renders — regardless of whether the previous card had
          its answer exposed.

---

## Feature 2: Compact Assign Button Touch Targets

**US-6.2** As a host on mobile, the "فريق ١" and "فريق ٢" assign buttons in the compact
          QuestionCard are tall enough (≥ 40px) to tap accurately under event pressure,
          so wrong-team assignments caused by mis-taps are eliminated.

---

## Feature 3: Desktop Host Strip Team Labels

**US-6.3** As a host on desktop, the top colored strip shows "فريق ١" and the team's
          current score, and the bottom colored strip shows "فريق ٢" and its score, so
          the host can identify each team at a glance without consulting the sidebar.

---

## Feature 4: Players List Key Stability

**US-6.4** As a host, the players list (both desktop sidebar and mobile settings sheet)
          uses each player's name as the React key rather than their list index, so the
          list never flickers or shows the wrong kick button when players join or leave.

---

## Feature 5: Buzz Mutation Error Feedback

**US-6.5** As a player, if the buzz HTTP request fails (network timeout, venue WiFi drop),
          the buzzer button pulses red for 800ms so I know the tap didn't register and I
          can tap again — rather than the button silently re-enabling with no feedback.

---

## Feature 6: Mobile Name Entry Keyboard Safety

**US-6.6** As a player on mobile, the "انضم" submit button on the name entry screen
          remains visible and tappable when the virtual keyboard is open, so I am never
          locked out of joining the game on small-screen devices.

---

## Feature 7: UI Polish

**US-6.7** As a TV viewer, the winning team name in the GameOverBanner never overflows
          the screen — it is clamped to 80vw with ellipsis so very long Arabic names
          remain readable on any projector resolution.

**US-6.8** As a TV viewer, the BuzzBanner content (bell, name, timer, reset button) never
          exceeds the 45dvh panel height on short displays — content is clipped gracefully
          rather than overflowing into the hex grid area.

**US-6.9** As a host, the "سؤال آخر" button in the compact QuestionCard shows "جارٍ..."
          label text while the next-question request is in flight, reducing re-tap anxiety.

**US-6.10** As a player, the buzzer button shows "جارٍ..." while the buzz HTTP request
           is pending, so I know the tap was registered and I don't tap again.
