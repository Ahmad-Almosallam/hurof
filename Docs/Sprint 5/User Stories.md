# Sprint 5 — Real-Time Reliability & UX Hardening

> Source: UX Research audit pass 3 (2026-04-01). All issues traced to specific components.

---

## Feature 1: useGameHub Lifecycle Stability

**US-5.1** As any connected client (host, player, TV), SignalR lifecycle callbacks
          (onreconnecting, onreconnected, onclose) are registered at most once per
          active connection and are correctly guarded against firing after a component
          unmounts, so that navigation, React Strict Mode double-mounts, and venue WiFi
          blips never produce ghost state updates or stale closure calls.

---

## Feature 2: TV BuzzBanner — Grid Remains Visible

**US-5.2** As a TV viewer, when a player buzzes in the announcement panel occupies the
          top ~45% of the screen while the hex grid remains visible in the lower portion,
          so the audience can see both who buzzed and which letter is in play simultaneously.

---

## Feature 3: Host Session Creation Error Feedback

**US-5.3** As a host, if creating a session fails (expired JWT, network error, server
          validation), a clear Arabic error message appears below the "ابدأ اللعبة"
          button so I know the game hasn't started and can take corrective action —
          rather than the button silently stopping.

---

## Feature 4: Unassign Dialog Team Context

**US-5.4** As a host, the confirmation dialog for unassigning a cell tells me which team
          currently owns that cell (e.g., "هذا الحرف لـ فريق ١ — إلغاء التعيين؟") so I
          can verify I'm undoing the right assignment before confirming.

---

## Feature 5: HexCell Hover Feedback

**US-5.5** As a host on desktop, hovering over any interactive cell shows a brightness
          increase so I have a visual affordance that a click will trigger an action —
          especially important for the active (amber) cell where the "click to deactivate"
          behaviour was added in Sprint 3.

---

## Feature 6: SignalR Connection Cleanup

**US-5.6** As a player who navigates away (kicked, session ended, manual exit), the
          SignalR connection is always stopped and removed from the singleton map on
          component unmount — regardless of the connection's current state — so stale
          connections never leak into future sessions.

---

## Feature 7: Double Buzz State Fix

**US-5.7** As a player, the buzzer state is set exclusively by the authoritative
          SignalR BuzzWinner event, not by a local optimistic update in the HTTP
          mutation's onSuccess. This eliminates the double-render flicker when the
          player's own buzz is accepted.

---

## Feature 8: UI Polish

**US-5.8** As a TV viewer, the "session ended" countdown banner always renders above
          the reconnect banner (higher z-index) so they never compete for the same
          layer during a server shutdown scenario.

**US-5.9** As a TV viewer, the hex grid edge team labels are legible on scaled-down
          grids by using a larger base font size (11px) so they remain readable when
          the grid scales below 0.85×.

**US-5.10** As a host, the "جولة جديدة" hold button label is concise enough to fit
           on a 375px screen without wrapping, with a subtitle communicating the
           hold mechanic separately.
