# CLAUDE.md

# Hurof (حروف) — Project Context

Real-time Arabic letter game show for live events.

## Roles
- **Host** — browser dashboard, controls the game
- **Player** — mobile buzzer, one big tap action
- **TV Display** — projector/screen, read-only hex grid for audience

## Tech Stack
- Backend: ASP.NET Core, SignalR, EF Core, SQL Server
- Frontend: React, RTL layout, Arabic fonts
- Real-time: WebSocket via SignalR

## Plugins Available
- `dotnet-skills` — use for ALL .NET/ASP.NET Core/EF Core/SignalR backend work
- `hurof-sprint` — sprint orchestration (run /sprint to start)

## Rules
- Always consider all 3 roles when changing shared logic
- Arabic RTL is not optional — verify layout direction on every frontend change
- SignalR hub methods must handle race conditions (buzzer competition)
- Never make sync DB calls inside hubs