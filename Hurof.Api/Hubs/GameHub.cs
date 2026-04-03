using Hurof.Api.Services;
using Microsoft.AspNetCore.SignalR;

namespace Hurof.Api.Hubs;

public class GameHub(IPlayerTrackerService playerTracker, IHostTrackerService hostTracker, ILeaderboardService leaderboard) : Hub
{
    public async Task JoinSession(string roomCode)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
    }

    public async Task JoinAsPlayer(string roomCode, string playerName)
    {
        if (string.IsNullOrWhiteSpace(playerName) || playerName.Length > 50) return;

        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);

        // Detect rename: check active registration first, then fall back to the last known name
        // (which survives a LeaveAsPlayer call). This handles the case where a player calls
        // LeaveAsPlayer and then re-joins with a new name — without the fallback, the old
        // leaderboard entry would be orphaned and a ghost duplicate would appear.
        var existing = playerTracker.GetInfo(Context.ConnectionId);
        var oldName = existing?.PlayerName ?? playerTracker.GetLastName(Context.ConnectionId);
        if (oldName is not null && oldName != playerName)
            await leaderboard.RenamePlayerAsync(roomCode, oldName, playerName);

        playerTracker.Register(Context.ConnectionId, roomCode, playerName);
        var players = playerTracker.GetPlayers(roomCode);
        await Clients.Group(roomCode).SendAsync("PlayerListUpdate", players);
    }

    public Task<bool> JoinAsHost(string roomCode)
    {
        return Task.FromResult(hostTracker.TryRegister(Context.ConnectionId, roomCode));
    }

    public async Task RequestPlayerList(string roomCode)
    {
        var players = playerTracker.GetPlayers(roomCode);
        await Clients.Caller.SendAsync("PlayerListUpdate", players);
    }

    public Task LeaveAsHost(string roomCode)
    {
        hostTracker.Unregister(Context.ConnectionId);
        return Task.CompletedTask;
    }

    public async Task LeaveAsPlayer(string roomCode)
    {
        var info = playerTracker.Unregister(Context.ConnectionId);
        if (info is not null)
        {
            var players = playerTracker.GetPlayers(roomCode);
            await Clients.Group(roomCode).SendAsync("PlayerListUpdate", players);
        }
    }

    public async Task KickPlayer(string roomCode, string playerName)
    {
        if (!hostTracker.IsHost(Context.ConnectionId, roomCode)) return;
        var connectionId = playerTracker.FindConnectionId(roomCode, playerName);
        if (connectionId is null) return;
        await Clients.Client(connectionId).SendAsync("YouWereKicked");
        playerTracker.Unregister(connectionId);
        var players = playerTracker.GetPlayers(roomCode);
        await Clients.Group(roomCode).SendAsync("PlayerListUpdate", players);
    }

    public async Task BroadcastTimerStart(string roomCode, int durationSeconds, int phase)
    {
        await Clients.OthersInGroup(roomCode).SendAsync("TimerStarted",
            new { durationSeconds, phase });
    }

    /// <summary>
    /// Resets the active streak for the current buzz contender without touching the buzzer lock.
    /// Call this when the host gives thinking time to the other team — the buzzing player got
    /// it wrong, so their streak breaks, but the buzzer UI should remain visible.
    /// </summary>
    public async Task ResetStreakForContender(string roomCode)
    {
        await leaderboard.RecordStreakResetForContenderAsync(roomCode);
    }

    public async Task LeaveSession(string roomCode)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomCode);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        hostTracker.Unregister(Context.ConnectionId);

        var info = playerTracker.Unregister(Context.ConnectionId);
        // Full disconnect — purge the last-name cache to prevent memory leaks on long-running servers.
        playerTracker.ForgetConnection(Context.ConnectionId);

        if (info is not null)
        {
            var players = playerTracker.GetPlayers(info.Value.RoomCode);
            await Clients.Group(info.Value.RoomCode).SendAsync("PlayerListUpdate", players);
        }
        await base.OnDisconnectedAsync(exception);
    }
}
