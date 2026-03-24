using System.Collections.Concurrent;

namespace Hurof.Api.Services;

public interface IHostTrackerService
{
    bool TryRegister(string connectionId, string roomCode);
    string? Unregister(string connectionId);
    bool IsHosted(string roomCode);
}

public class HostTrackerService : IHostTrackerService
{
    // connectionId -> roomCode
    private readonly ConcurrentDictionary<string, string> _connections = new();
    // roomCode -> connectionId
    private readonly ConcurrentDictionary<string, string> _rooms = new();

    public bool TryRegister(string connectionId, string roomCode)
    {
        if (_rooms.TryAdd(roomCode, connectionId))
        {
            _connections[connectionId] = roomCode;
            return true;
        }
        return false;
    }

    public string? Unregister(string connectionId)
    {
        if (_connections.TryRemove(connectionId, out var roomCode))
        {
            _rooms.TryRemove(roomCode, out _);
            return roomCode;
        }
        return null;
    }

    public bool IsHosted(string roomCode) => _rooms.ContainsKey(roomCode);
}
