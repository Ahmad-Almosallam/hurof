using Hurof.Api.DTOs.Letters;
using Hurof.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hurof.Api.Controllers;

[ApiController]
[Route("api/sessions/{identifier}/letters")]
public class LettersController(ILetterService letterService) : ControllerBase
{
    [HttpPatch("{cellId:guid}/state")]
    public async Task<IActionResult> SetState(string identifier, Guid cellId, [FromBody] SetLetterStateRequest request)
    {
        var result = await letterService.SetStateAsync(identifier, cellId, request.State);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("{cellId:guid}/question")]
    public async Task<IActionResult> GetQuestion(string identifier, Guid cellId)
    {
        try
        {
            var question = await letterService.GetCurrentQuestionAsync(identifier, cellId);
            return question is null ? NotFound() : Ok(question);
        }
        catch (ExternalApiException ex)
        {
            return UnprocessableEntity(new { error = ex.Message });
        }
    }

    [HttpPost("{cellId:guid}/next-question")]
    public async Task<IActionResult> NextQuestion(string identifier, Guid cellId)
    {
        try
        {
            var question = await letterService.GetNextQuestionAsync(identifier, cellId);
            return question is null ? NotFound() : Ok(question);
        }
        catch (ExternalApiException ex)
        {
            return UnprocessableEntity(new { error = ex.Message });
        }
    }
}
