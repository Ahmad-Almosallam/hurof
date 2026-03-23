using System.Collections.Concurrent;

namespace Hurof.Api.Services;

public interface IPlayerTrackerService
{
    void Register(string connectionId, string roomCode, string playerName);
    (string RoomCode, string PlayerName)? Unregister(string connectionId);
    IReadOnlyList<string> GetPlayers(string roomCode);
}

public class PlayerTrackerService : IPlayerTrackerService
{
    private readonly ConcurrentDictionary<string, (string RoomCode, string PlayerName)> _connections = new();

    public void Register(string connectionId, string roomCode, string playerName)
    {
        _connections[connectionId] = (roomCode, playerName);
    }

    public (string RoomCode, string PlayerName)? Unregister(string connectionId)
    {
        return _connections.TryRemove(connectionId, out var info) ? info : null;
    }

    public IReadOnlyList<string> GetPlayers(string roomCode)
    {
        return _connections.Values
            .Where(v => v.RoomCode == roomCode)
            .Select(v => v.PlayerName)
            .ToList();
    }
}
