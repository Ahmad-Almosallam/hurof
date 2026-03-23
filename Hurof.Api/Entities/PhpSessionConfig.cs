namespace Hurof.Api.Entities;

public class PhpSessionConfig
{
    public int Id { get; set; }
    public string PhpSessionId { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
}
