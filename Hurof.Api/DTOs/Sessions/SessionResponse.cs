using Hurof.Api.DTOs.Letters;

namespace Hurof.Api.DTOs.Sessions;

public record SessionResponse(
    Guid Id,
    string RoomCode,
    int GridSize,
    string Status,
    string Team1Color,
    string Team2Color,
    int? WinnerTeam,
    string? BuzzerLockedByPlayer,
    DateTime? BuzzerLockedAt,
    List<LetterCellResponse> Cells
);
