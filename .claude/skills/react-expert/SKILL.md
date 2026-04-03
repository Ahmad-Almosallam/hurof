---
name: react-expert
description: >
  Use when building React components for Hurof (حروف) — the real-time Arabic letter
  game show app. Covers all three views: Host dashboard, Player mobile buzzer, and
  TV Display hex grid. Triggers for SignalR WebSocket integration in React, RTL Arabic
  layout, buzzer state management, hex grid rendering, and real-time multiplayer UI.
  Also trigger automatically during /frontend command for any Hurof component work.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: frontend
  triggers: React, JSX, hooks, useState, useEffect, SignalR, WebSocket, RTL, Arabic, buzzer, hex grid, Host, Player, TV Display, Hurof, real-time, multiplayer
  role: specialist
  scope: implementation
  output-format: code
  related-skills: hurof-ux-researcher, hurof-ba, frontend-design
---

# React Expert — Hurof Edition

Senior React specialist focused on Hurof's three-role real-time architecture:
Host dashboard, Player mobile buzzer, and TV Display hex grid.

## Hurof View Context

| View | Device | Key Concerns |
|------|--------|--------------|
| Host Dashboard | Browser | Game controls, buzzer management, letter activation |
| Player Buzzer | Mobile phone | Single tap action, instant feedback, RTL Arabic |
| TV Display | Projector/screen | Hex grid, scores, win animation, readable at 10m |

## When to Use This Skill

- Building or editing Host, Player, or TV Display components
- Integrating SignalR events into React state
- RTL Arabic layout and Arabic font rendering in components
- Hex grid rendering and path visualization
- Buzzer state management (idle / locked / released)
- Real-time multiplayer UI updates without flicker
- Mobile-first Player view optimization
- Win detection animation on TV Display

## Core Workflow

1. **Identify the role** — which view does this component belong to? (Host / Player / TV Display)
2. **Analyze requirements** — what game state does this component read? what does it emit?
3. **Map SignalR events** — which hub methods trigger updates to this component?
4. **Implement** — write TypeScript components with proper types
5. **Validate** — run `tsc --noEmit`; fix all type errors before proceeding
6. **RTL check** — verify `dir="rtl"` on containers, flex layout direction, Arabic font stack
7. **Real-time check** — are SignalR updates causing unnecessary re-renders? batch where possible
8. **Role check** — apply hurof-ux-researcher lens before marking done

## Hurof-Specific Patterns

### SignalR Hook (reusable across views)
```tsx