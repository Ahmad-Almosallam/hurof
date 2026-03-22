namespace Hurof.Api.Entities;

public class Question
{
    public Guid Id { get; set; }
    public string Letter { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
