using Hurof.Api.DTOs.Sessions;
using Hurof.Api.Hubs;
using Hurof.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Hurof.Api.Controllers;

[ApiController]
[Route("api/sessions")]
public class SessionsController(ISessionService sessionService, IHubContext<GameHub> hubContext) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSessionRequest request)
    {
        var session = await sessionService.CreateSessionAsync(request);
        return Ok(session);
    }

    [HttpGet("{identifier}")]
    public async Task<IActionResult> Get(string identifier)
    {
        var session = await sessionService.GetSessionAsync(identifier);
        return session is null ? NotFound() : Ok(session);
    }

    [HttpDelete("{identifier}")]
    public async Task<IActionResult> End(string identifier)
    {
        var ended = await sessionService.EndSessionAsync(identifier);
        if (!ended) return NotFound();
        await hubContext.Clients.Group(identifier).SendAsync("SessionEnded");
        return NoContent();
    }

    [HttpPost("{identifier}/reset")]
    public async Task<IActionResult> Reset(string identifier)
    {
        var reset = await sessionService.ResetSessionAsync(identifier);
        return reset ? Ok() : NotFound();
    }
}
