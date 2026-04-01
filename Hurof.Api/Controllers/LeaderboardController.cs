using Hurof.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hurof.Api.Controllers;

[ApiController]
[Route("api/sessions/{roomId}/leaderboard")]
public class LeaderboardController(ILeaderboardService leaderboard) : ControllerBase
{
    [HttpGet]
    public IActionResult Get(string roomId)
    {
        var entries = leaderboard.GetLeaderboard(roomId);
        return Ok(new { entries });
    }
}
