# Sprint 2 — User Stories

## Feature 1: New Round Without Re-joining

**US-2.1** As a host, after a team wins I want a "جولة جديدة" button so I can reset the grid
          with new letters while keeping the same room code.

**US-2.2** As a host, when I start a new round the grid resets to all-unselected cells with
          fresh letters, scores reset to 0, and the buzzer clears.

**US-2.3** As a TV viewer, when the host starts a new round the game-over banner disappears
          and the new grid appears automatically without any action on my part.

**US-2.4** As a player, when the host starts a new round the game-over banner disappears and
          my buzzer returns to the waiting state automatically.

**US-2.5** As the system, on win detection the session is NOT deleted — it stays in the DB
          in "Ended" status so a new round can be started. The session is only deleted
          when the host explicitly clicks "إنهاء اللعبة".

## Feature 2: Responsive TV Grid

**US-2.6** As a TV viewer on any screen size (from a phone to a 75" TV), the hex grid
          scales down or up to fit the available viewport without overflow or scrollbars.

**US-2.7** As a TV viewer, the grid scaling works the same way as the host dashboard —
          using ResizeObserver to recalculate scale when the window resizes.

## Feature 3: SignalR Connectivity Status + Auto-resync

**US-2.8** As a host/player/TV viewer, I can see a small connectivity indicator showing
          whether I am connected, reconnecting, or disconnected from the game server.

**US-2.9** As a player who backgrounds the app and returns, my session state (active letter,
          buzzer lock, game-over) is automatically re-synced when SignalR reconnects.

**US-2.10** As a host who loses connection briefly, the grid and session state are
           automatically re-synced when SignalR reconnects.

**US-2.11** As a TV viewer who loses connection, the grid is automatically re-synced
           when SignalR reconnects.

## Feature 4: Host Player List

**US-2.12** As a host, I can see a "اللاعبون" tab in my sidebar that lists all players
           currently connected to the room.

**US-2.13** As a host, each player in the list shows their name and how many are connected.

**US-2.14** As a host, the player list updates in real time as players join or leave.

**US-2.15** As a player, when I join the buzzer page my name is registered with the room
           so the host can see me in the player list.
