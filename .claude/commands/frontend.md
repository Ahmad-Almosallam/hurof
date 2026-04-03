You are running the Hurof frontend sprint phase.

## Skills to apply
- `hurof-ux` skill — analyze every screen through Host / Player / TV Display lens
- `frontend-design` skill — make it visually distinctive, not generic
- `react-expert` skill — best practices for react

## Context
- React app with Arabic RTL support
- 3 separate views: Host dashboard, Player buzzer, TV Display
- Live event environment: noisy venue, audience watching, host under pressure

## Your job
1. Based on the BA, decide what pages will be effected
2. Based on the BA, decide what the user need to see or do on this screen
3. Apply hurof-ux analysis — check all 3 role lenses before writing code
4. Apply frontend-design principles — commit to a bold aesthetic direction
5. Implement the component(s)

## RTL Rules (non-negotiable)
- All containers must have `dir="rtl"` where Arabic text appears
- Flex/grid layouts must be verified to flip correctly in RTL
- Arabic fonts must use a proper font stack (not system default)
- Arabic letters in SVG hexagons need explicit font-family

## Performance Rules
- Buzzer button must have zero loading states — instant visual feedback
- WebSocket event handlers must not trigger unnecessary re-renders
- Batch setState calls where possible

## After each component
Run hurof-ux analysis on what was just built:
- Does it survive a noisy live event?
- Is the primary action reachable with one thumb (Player)?
- Is it readable from 5-10 meters (TV Display)?
- Can the host act without looking away from the room (Host)?

When done, summarize changes per role affected.