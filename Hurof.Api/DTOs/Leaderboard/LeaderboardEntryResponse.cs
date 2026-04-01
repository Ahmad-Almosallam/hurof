namespace Hurof.Api.DTOs.Leaderboard;

public record LeaderboardEntryResponse(
    int Rank,
    string PlayerName,
    int CorrectAnswersCount,
    int ActiveStreak,
    int LongestStreak
);
