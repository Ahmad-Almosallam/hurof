using Hurof.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hurof.Api.Controllers;

[ApiController]
[Route("api/php-session")]
public class PhpSessionController(IExternalQuestionService externalQuestions) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var value = await externalQuestions.GetCurrentPhpSessionAsync();
        return Ok(new { phpSessionId = value });
    }

    [HttpPut]
    public async Task<IActionResult> Put([FromBody] UpdatePhpSessionRequest request)
    {
        await externalQuestions.UpdatePhpSessionAsync(request.PhpSessionId);
        return Ok(new { phpSessionId = request.PhpSessionId });
    }
}

public record UpdatePhpSessionRequest(string PhpSessionId);
