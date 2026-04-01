using System.Collections.Concurrent;
using Hurof.Api.DTOs.Leaderboard;
using Hurof.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Hurof.Api.Services;

public interface ILeaderboardService
{
    Task RecordCorrectAnswerAsync(string roomCode, string playerName);
    Task RecordStreakResetAsync(string roomCode, string playerName);
    IReadOnlyList<LeaderboardEntryResponse> GetLeaderboard(string roomCode);
    void ClearRoom(string roomCode);
}

public class LeaderboardService(IHubContext<GameHub> hubContext) : ILeaderboardService
{
    private sealed class PlayerStats
    {
        public int CorrectAnswersCount;
        public int ActiveStreak;
        public int LongestStreak;
    }

    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, PlayerStats>> _rooms = new();

    public async Task RecordCorrectAnswerAsync(string roomCode, string playerName)
    {
        var stats = GetOrCreate(roomCode, playerName);
        lock (stats)
        {
            stats.CorrectAnswersCount++;
            stats.ActiveStreak++;
            if (stats.ActiveStreak > stats.LongestStreak)
                stats.LongestStreak = stats.ActiveStreak;
        }
        await BroadcastLeaderboardAsync(roomCode);
    }

    public async Task RecordStreakResetAsync(string roomCode, string playerName)
    {
        var stats = GetOrCreate(roomCode, playerName);
        lock (stats)
        {
            stats.ActiveStreak = 0;
        }
        await BroadcastLeaderboardAsync(roomCode);
    }

    public IReadOnlyList<LeaderboardEntryResponse> GetLeaderboard(string roomCode)
    {
        return BuildLeaderboard(roomCode);
    }

    public void ClearRoom(string roomCode)
    {
        _rooms.TryRemove(roomCode, out _);
    }

    private async Task BroadcastLeaderboardAsync(string roomCode)
    {
        var entries = BuildLeaderboard(roomCode);
        await hubContext.Clients.Group(roomCode)
            .SendAsync("LeaderboardUpdated", new { entries });
    }

    private List<LeaderboardEntryResponse> BuildLeaderboard(string roomCode)
    {
        if (!_rooms.TryGetValue(roomCode, out var players))
            return [];

        return players
            .Select(kv =>
            {
                lock (kv.Value)
                {
                    return (PlayerName: kv.Key, kv.Value.CorrectAnswersCount, kv.Value.ActiveStreak, kv.Value.LongestStreak);
                }
            })
            .OrderByDescending(p => p.CorrectAnswersCount)
            .ThenByDescending(p => p.LongestStreak)
            .Select((p, i) => new LeaderboardEntryResponse(i + 1, p.PlayerName, p.CorrectAnswersCount, p.ActiveStreak, p.LongestStreak))
            .ToList();
    }

    private PlayerStats GetOrCreate(string roomCode, string playerName)
    {
        var room = _rooms.GetOrAdd(roomCode, _ => new ConcurrentDictionary<string, PlayerStats>());
        return room.GetOrAdd(playerName, _ => new PlayerStats());
    }
}
