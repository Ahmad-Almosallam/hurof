namespace Hurof.Api.Entities;

public class LetterCell
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public int Row { get; set; }
    public int Col { get; set; }
    public string Letter { get; set; } = string.Empty;
    public LetterState State { get; set; } = LetterState.Unselected;
    public int QuestionIndex { get; set; } = 0;

    public GameSession Session { get; set; } = null!;
}
