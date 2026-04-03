You are running the Hurof backend sprint phase.

Apply `dotnet-skills` plugin patterns throughout this phase.

## Context
This is an ASP.NET Core app with SignalR for real-time communication.
There are 3 client types connecting: Host, Player, TV Display.
Each joins a different SignalR group and receives different events.

## Your job
1. Ask: "What specifically needs to be built or fixed on the backend?"
2. Identify which SignalR hub(s) are involved
3. Identify which EF Core entities / DB tables are touched
4. Check for race conditions — especially buzzer lock-in logic
5. Implement using dotnet-skills:csharp-coding-standards and dotnet-skills:csharp-concurrency-patterns and dotnet-skills:csharp-api-design
6. Use dotnet-skills:efcore-patterns for all database work
7. Use `signalr` skill for all hub and real-time logic

## Rules
- All hub methods must be async
- No sync DB calls inside SignalR hubs
- Buzzer lock-in must be atomic — use locks or DB transactions
- Emit typed events to the correct groups (Host / Player / TV Display)
- Validate all inputs coming from Player clients — they are untrusted
- Follow existing schema constants for multi-schema DB design

When done, summarize:
- What was built
- Which SignalR events were added or modified
- Any DB migrations needed