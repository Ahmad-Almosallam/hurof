using Hurof.Api.DTOs.Buzzer;
using Hurof.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hurof.Api.Controllers;

[ApiController]
[Route("api/sessions/{identifier}/buzzer")]
public class BuzzerController(IBuzzerService buzzerService) : ControllerBase
{
    [HttpPost("buzz")]
    public async Task<IActionResult> Buzz(string identifier, [FromBody] BuzzRequest request)
    {
        var result = await buzzerService.BuzzAsync(identifier, request.PlayerName);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("reset")]
    public async Task<IActionResult> Reset(string identifier)
    {
        var reset = await buzzerService.ResetAsync(identifier);
        return reset ? NoContent() : NotFound();
    }
}
