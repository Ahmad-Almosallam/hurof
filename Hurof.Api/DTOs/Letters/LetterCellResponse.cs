namespace Hurof.Api.DTOs.Letters;

public record LetterCellResponse(
    Guid Id,
    int Row,
    int Col,
    string Letter,
    string State
);
