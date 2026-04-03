using System.Collections.Concurrent;
using Hurof.Api.DTOs.Leaderboard;
using Hurof.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Hurof.Api.Services;

public interface ILeaderboardService
{
    /// <summary>Called when a player wins the buzzer. Stores them as the active contender for this room.</summary>
    void SetCurrentContender(string roomCode, string playerName);

    /// <summary>
    /// Called when a letter is assigned to a team. Records a correct answer for whoever is the
    /// current contender, then clears the contender so a subsequent buzzer reset does not also
    /// penalise them with a streak reset.
    /// </summary>
    Task RecordCorrectAnswerForContenderAsync(string roomCode);

    /// <summary>
    /// Called when the host resets the buzzer. Only resets the streak if a contender is still
    /// set (i.e. the correct answer was not already recorded for this buzz round).
    /// </summary>
    Task RecordStreakResetForContenderAsync(string roomCode);

    /// <summary>
    /// Migrates all stats from <paramref name="oldName"/> to <paramref name="newName"/> and
    /// updates the active contender if needed. Call this when a player renames mid-session.
    /// </summary>
    Task RenamePlayerAsync(string roomCode, string oldName, string newName);

    /// <summary>
    /// Ensures a player has a leaderboard entry (with zeroed stats if new).
    /// Call this when a player joins so they appear immediately, before any buzz.
    /// </summary>
    Task EnsurePlayerAsync(string roomCode, string playerName);

    /// <summary>
    /// Silently drops the active contender for the room without touching any stats.
    /// Call this when a new letter is activated so a stale buzz winner from the previous
    /// round cannot accidentally receive credit.
    /// </summary>
    void ClearContender(string roomCode);

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

    // roomCode → playerName stats
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, PlayerStats>> _rooms = new();

    // roomCode → current buzzer contender (the player who buzzed last and hasn't been resolved yet)
    private readonly ConcurrentDictionary<string, string> _contenders = new();

    public async Task EnsurePlayerAsync(string roomCode, string playerName)
    {
        GetOrCreate(roomCode, playerName);
        await BroadcastLeaderboardAsync(roomCode);
    }

    public void SetCurrentContender(string roomCode, string playerName)
    {
        _contenders[roomCode] = playerName;
        // Ensure the player entry exists so they appear in the leaderboard immediately
        GetOrCreate(roomCode, playerName);
    }

    public async Task RecordCorrectAnswerForContenderAsync(string roomCode)
    {
        if (!_contenders.TryRemove(roomCode, out var playerName)) return;

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

    public async Task RecordStreakResetForContenderAsync(string roomCode)
    {
        // Only act if there is still an unresolved contender (correct answer clears it first)
        if (!_contenders.TryRemove(roomCode, out var playerName)) return;

        var stats = GetOrCreate(roomCode, playerName);
        lock (stats)
        {
            stats.ActiveStreak = 0;
        }
        await BroadcastLeaderboardAsync(roomCode);
    }

    public async Task RenamePlayerAsync(string roomCode, string oldName, string newName)
    {
        if (oldName == newName) return;

        if (!_rooms.TryGetValue(roomCode, out var players)) return;

        // Update contender first so any concurrent RecordCorrectAnswer call already sees
        // the new name before we move the stats entry.
        _contenders.TryUpdate(roomCode, newName, oldName);

        // Migrate stats: remove old entry, insert under new name.
        // TryAdd is a no-op if newName already exists (second rename to same target) — safe.
        if (players.TryRemove(oldName, out var stats))
            players.TryAdd(newName, stats);

        await BroadcastLeaderboardAsync(roomCode);
    }

    public void ClearContender(string roomCode)
    {
        _contenders.TryRemove(roomCode, out _);
    }

    public IReadOnlyList<LeaderboardEntryResponse> GetLeaderboard(string roomCode) =>
        BuildLeaderboard(roomCode);

    public void ClearRoom(string roomCode)
    {
        _rooms.TryRemove(roomCode, out _);
        _contenders.TryRemove(roomCode, out _);
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
            .ThenBy(p => p.PlayerName)
            .Select((p, i) => new LeaderboardEntryResponse(i + 1, p.PlayerName, p.CorrectAnswersCount, p.ActiveStreak, p.LongestStreak))
            .ToList();
    }

    private PlayerStats GetOrCreate(string roomCode, string playerName)
    {
        var room = _rooms.GetOrAdd(roomCode, _ => new ConcurrentDictionary<string, PlayerStats>());
        return room.GetOrAdd(playerName, _ => new PlayerStats());
    }
}
