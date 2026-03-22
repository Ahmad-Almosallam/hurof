using System.ComponentModel.DataAnnotations;

namespace Hurof.Api.DTOs.Sessions;

public record CreateSessionRequest(
    [Range(3, 11)] int GridSize = 5,
    string Team1Color = "#e74c3c",
    string Team2Color = "#3498db"
);
