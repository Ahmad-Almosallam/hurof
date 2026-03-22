namespace Hurof.Api.DTOs.Letters;

public record GridPosition(int Row, int Col);

public record SetLetterStateResponse(
    LetterCellResponse Cell,
    bool WinDetected,
    int? WinnerTeam,
    List<GridPosition>? WinningPath
);
