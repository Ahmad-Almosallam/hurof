using System.Collections.Concurrent;

namespace Hurof.Api.Services;

public interface IPlayerTrackerService
{
    void Register(string connectionId, string roomCode, string playerName);
    (string RoomCode, string PlayerName)? Unregister(string connectionId);
    (string RoomCode, string PlayerName)? GetInfo(string connectionId);

    /// <summary>
    /// Returns the last player name this connection registered under, even if the connection
    /// has since been unregistered (e.g. via LeaveAsPlayer). Used to detect renames when the
    /// player re-joins after calling LeaveAsPlayer mid-session.
    /// </summary>
    string? GetLastName(string connectionId);

    /// <summary>Removes the last-name cache entry. Call on full disconnect to prevent memory leaks.</summary>
    void ForgetConnection(string connectionId);

    IReadOnlyList<string> GetPlayers(string roomCode);
    string? FindConnectionId(string roomCode, string playerName);
}

public class PlayerTrackerService : IPlayerTrackerService
{
    private readonly ConcurrentDictionary<string, (string RoomCode, string PlayerName)> _connections = new();

    // Survives Unregister so JoinAsPlayer can detect renames after a LeaveAsPlayer/rejoin cycle.
    private readonly ConcurrentDictionary<string, string> _lastNames = new();

    public void Register(string connectionId, string roomCode, string playerName)
    {
        _connections[connectionId] = (roomCode, playerName);
        _lastNames[connectionId] = playerName;
    }

    public (string RoomCode, string PlayerName)? Unregister(string connectionId)
    {
        // Intentionally does NOT clear _lastNames — the name must survive for rename detection.
        return _connections.TryRemove(connectionId, out var info) ? info : null;
    }

    public (string RoomCode, string PlayerName)? GetInfo(string connectionId)
    {
        return _connections.TryGetValue(connectionId, out var info) ? info : null;
    }

    public string? GetLastName(string connectionId)
    {
        return _lastNames.TryGetValue(connectionId, out var name) ? name : null;
    }

    public void ForgetConnection(string connectionId)
    {
        _connections.TryRemove(connectionId, out _);
        _lastNames.TryRemove(connectionId, out _);
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
