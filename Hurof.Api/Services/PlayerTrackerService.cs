using System.Collections.Concurrent;

namespace Hurof.Api.Services;

public interface IPlayerTrackerService
{
    void Register(string connectionId, string roomCode, string playerName);
    (string RoomCode, string PlayerName)? Unregister(string connectionId);
    (string RoomCode, string PlayerName)? GetInfo(string connectionId);
    IReadOnlyList<string> GetPlayers(string roomCode);
    string? FindConnectionId(string roomCode, string playerName);
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

    public (string RoomCode, string PlayerName)? GetInfo(string connectionId)
    {
        return _connections.TryGetValue(connectionId, out var info) ? info : null;
    }

    public IReadOnlyList<string> GetPlayers(string roomCode)
    {
        return _connections.Values
            .Where(v => v.RoomCode == roomCode)
            .Select(v => v.PlayerName)
            .ToList();
    }

    public string? FindConnectionId(string roomCode, string playerName)
    {
        return _connections
            .FirstOrDefault(kv => kv.Value.RoomCode == roomCode && kv.Value.PlayerName == playerName)
            .Key;
    }
}
