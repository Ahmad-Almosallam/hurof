namespace Hurof.Api.DTOs.Letters;

public record QuestionResponse(
    Guid QuestionId,
    string Letter,
    string QuestionText,
    string Answer,
    int QuestionIndex,
    int TotalQuestions
);
