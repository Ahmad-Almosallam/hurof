namespace Hurof.Api.Entities;

public class GameSession
{
    public Guid Id { get; set; }
    public string RoomCode { get; set; } = string.Empty;
    public int GridSize { get; set; }
    public string Team1Color { get; set; } = "#e74c3c";
    public string Team2Color { get; set; } = "#3498db";
    public SessionStatus Status { get; set; } = SessionStatus.Active;
    public int? WinnerTeam { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
    public string? BuzzerLockedByPlayer { get; set; }
    public DateTime? BuzzerLockedAt { get; set; }

    public ICollection<LetterCell> LetterCells { get; set; } = new List<LetterCell>();
}
