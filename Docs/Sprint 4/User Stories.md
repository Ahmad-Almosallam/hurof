# Sprint 4 — UX Polish Round 2

> Source: UX Research audit pass 2 (2026-03-31). All issues traced to specific components.

---

## Feature 1: Game-Over Flow Safety

**US-4.1** As a host, the "جولة جديدة" button requires a press-and-hold of ~600ms before
          firing, with a visible circular fill animation during the hold, so an accidental
          single tap during post-win celebration never resets the grid for all devices.

**US-4.2** As a host, the "الرئيسية" button on the game-over screen is replaced with
          "إنهاء اللعبة" that triggers the session delete mutation before navigating home,
          so the session is properly cleaned up and players are notified rather than
          left connected to a ghost room.

---

## Feature 2: Hex Grid Interaction & Clarity

**US-4.3** As a host, when I hover over an active (amber) cell the cursor changes to
          a pointer, so I know I can click it to deactivate it — matching the behavior
          added in Sprint 3.

**US-4.4** As a TV viewer and host, the hex grid's top/bottom colored edge bars display
          a small team label (e.g. "فريق ١") and the left/right edge bars display a
          label for team 2, so the audience understands which direction each team
          must connect without being told verbally.

---

## Feature 3: TV Display Connection Feedback

**US-4.5** As a TV viewer, when the connection is in the "Reconnecting" state (brief
          blip) a semi-transparent fullscreen overlay appears with the spinner and
          "جارٍ إعادة الاتصال...", so the audience never sees a frozen screen without
          context — even during short reconnects.

**US-4.6** As a TV viewer, the small `ConnectionStatus` dot is removed from the TV
          header since the fullscreen overlay (US-4.5) covers both Reconnecting and
          Disconnected states more visibly.

---

## Feature 4: Mobile Settings Labels Fix

**US-4.7** As a host using the mobile settings sheet, the timer input labels read
          "وقت الضغط (ث)" and "وقت التفكير (ث)" — matching the desktop sidebar and
          the BuzzBanner labels updated in Sprint 3.

---

## Feature 5: Player Buzzer Reliability

**US-4.8** As a player, the win haptic callback correctly references the current player
          name via a stable closure (not sessionStorage), so the haptic fires reliably
          even if the callback was created before the name was committed to storage.

**US-4.9** As a player, the "انتظر اختيار الحرف" subtitle uses the flex container's
          gap for spacing instead of a negative margin, so it never overlaps the buzzer
          button on small viewports (iPhone SE, foldables).

**US-4.10** As a player who reconnects after the host has ended the session, the
           reconnect handler checks `session.status === 'Ended'` and navigates home,
           so the player is not stuck on a buzzer page for a deleted session.

---

## Feature 6: Landing Page Discoverability

**US-4.11** As a host rejoining on a new device, the "انضم كمضيف" button is visible
           enough to find (base opacity ≥ 0.7) so it doesn't require hunting for a
           nearly-invisible control under time pressure.

**US-4.12** As a player, the "انضم للعبة" and "شاشة العرض" buttons stay disabled
           until at least 4 digits are entered in the room-code field, preventing
           navigation to a guaranteed-invalid session URL.
