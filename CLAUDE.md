# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hurof** is a real-time Arabic letter quiz app for live events. Two teams compete on a hexagonal grid of Arabic letters:
- **Team 1** wins by connecting a path from **Top to Bottom**
- **Team 2** wins by connecting a path from **Left to Right**

See `Docs/User Stories.md` for full requirements and `Docs/AI Prompt.md` for the original design brief.

## Planned Tech Stack

- **Backend:** ASP.NET Core Web API (.NET 8), EF Core + SQL Server, SignalR
- **Frontend:** React (Vite) + Tailwind CSS
- **Auth:** JWT for the Host role
- **Real-time:** SignalR hub for buzzer, grid updates, and win announcements

## Architecture Decisions (from docs)

- **No Clean Architecture, no CQRS, no MediatR** — Controllers + Services pattern only
- **State management on frontend:** `useState` / React Query (no Redux)
- **Three client roles:** Host (web), Player (buzzer page), TV Display (read-only grid view)
- **Grid:** Hexagonal layout with configurable size (e.g., 5×5, 7×7); each cell has hexagonal coordinates
- **Win detection:** BFS/DFS or Disjoint Set Union on hex grid after every letter assignment

## Key Domain Rules

- Letters cycle: `Unselected → Active → Assigned(Team1|Team2)` or back to `Unselected`
- Only one letter can be `Active` at a time per session
- Buzzer locks on first buzz; Host must explicitly reset it
- Backend auto-detects winning path after each assignment and broadcasts `GameOver` with path coordinates
- Questions are keyed per letter; multiple questions per letter supported (cycling on incorrect answers)
