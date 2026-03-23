using Hurof.Api.Services;
using Microsoft.AspNetCore.SignalR;

namespace Hurof.Api.Hubs;

public class GameHub(IPlayerTrackerService playerTracker) : Hub
{
    public async Task JoinSession(string roomCode)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
    }

    public async Task JoinAsPlayer(string roomCode, string playerName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
        playerTracker.Register(Context.ConnectionId, roomCode, playerName);
        var players = playerTracker.GetPlayers(roomCode);
        await Clients.Group(roomCode).SendAsync("PlayerListUpdate", players);
    }

    public async Task LeaveSession(string roomCode)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomCode);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var info = playerTracker.Unregister(Context.ConnectionId);
        if (info is not null)
        {
            var players = playerTracker.GetPlayers(info.Value.RoomCode);
            await Clients.Group(info.Value.RoomCode).SendAsync("PlayerListUpdate", players);
        }
        await base.OnDisconnectedAsync(exception);
    }
}
