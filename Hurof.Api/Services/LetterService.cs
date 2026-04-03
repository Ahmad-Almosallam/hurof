using Hurof.Api.Data;
using Hurof.Api.DTOs.Letters;
using Hurof.Api.Entities;
using Hurof.Api.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Hurof.Api.Services;

public interface ILetterService
{
    Task<SetLetterStateResponse?> SetStateAsync(string identifier, Guid cellId, LetterState newState);
    Task<QuestionResponse?> GetCurrentQuestionAsync(string identifier, Guid cellId);
    Task<QuestionResponse?> GetNextQuestionAsync(string identifier, Guid cellId);
}

public class LetterService(
    AppDbContext db,
    IWinDetectionService winDetection,
    IHubContext<GameHub> hubContext,
    IExternalQuestionService externalQuestions,
    ILeaderboardService leaderboard) : ILetterService
{
    public async Task<SetLetterStateResponse?> SetStateAsync(string identifier, Guid cellId, LetterState newState)
    {
        var session = await ResolveWithCellsAsync(identifier);

        if (session is null) return null;

        var cell = session.LetterCells.FirstOrDefault(c => c.Id == cellId);
        if (cell is null) return null;

        // Enforce single-Active rule
        LetterCell? previousActive = null;
        if (newState == LetterState.Active)
        {
            previousActive = session.LetterCells.FirstOrDefault(c => c.State == LetterState.Active);
            if (previousActive is not null)
                previousActive.State = LetterState.Unselected;

            // Drop any stale contender from a previous buzz round so they can't
            // accidentally receive credit for this new letter.
            leaderboard.ClearContender(session.RoomCode);
        }

        cell.State = newState;
        await db.SaveChangesAsync();

        // Broadcast the deactivated cell first so clients clear it
        if (previousActive is not null)
        {
            await hubContext.Clients.Group(session.RoomCode)
                .SendAsync("GridUpdate", new LetterCellResponse(
                    previousActive.Id, previousActive.Row, previousActive.Col,
                    previousActive.Letter, previousActive.State.ToString()));
        }

        var cellResponse = new LetterCellResponse(cell.Id, cell.Row, cell.Col, cell.Letter, cell.State.ToString());

        await hubContext.Clients.Group(session.RoomCode)
            .SendAsync("GridUpdate", cellResponse);

        // When assigning to a team: record correct answer then auto-reset the buzzer.
        // The frontend must NOT call the reset API separately — doing so races with this
        // call and can delete the contender before RecordCorrectAnswer runs.
        if (newState is LetterState.AssignedTeam1 or LetterState.AssignedTeam2)
        {
            await leaderboard.RecordCorrectAnswerForContenderAsync(session.RoomCode);

            // Auto-reset buzzer so the host doesn't need to call a second API
            session.BuzzerLockedByPlayer = null;
            session.BuzzerLockedAt = null;
            await db.SaveChangesAsync();
            await hubContext.Clients.Group(session.RoomCode).SendAsync("BuzzerReset");
        }

        // Check for win only on assignment
        WinResult? winResult = null;
        if (newState is LetterState.AssignedTeam1 or LetterState.AssignedTeam2)
        {
            winResult = winDetection.DetectWin(session.LetterCells, session.GridSize);
            if (winResult is not null)
            {
                var finalLeaderboard = leaderboard.GetLeaderboard(session.RoomCode);
                await hubContext.Clients.Group(session.RoomCode)
                    .SendAsync("GameOver", new
                    {
                        winnerTeam = winResult.WinnerTeam,
                        winningPath = winResult.Path,
                        leaderboard = finalLeaderboard
                    });

                session.Status = SessionStatus.Ended;
                session.WinnerTeam = winResult.WinnerTeam;
                await db.SaveChangesAsync();
            }
        }

        return new SetLetterStateResponse(
            cellResponse,
            winResult is not null,
            winResult?.WinnerTeam,
            winResult?.Path
        );
    }

    public async Task<QuestionResponse?> GetCurrentQuestionAsync(string identifier, Guid cellId)
    {
        var session = await ResolveAsync(identifier);
        if (session is null) return null;

        var cell = await db.LetterCells
            .FirstOrDefaultAsync(c => c.Id == cellId && c.SessionId == session.Id);

        if (cell is null) return null;

        var external = await externalQuestions.GetQuestionAsync(cell.Letter);
        if (external is not null)
            return new QuestionResponse(Guid.Empty, cell.Letter, external.Value.Question, external.Value.Answer, cell.QuestionIndex, 1);

        return await GetQuestionAtIndex(cell.Letter, cell.QuestionIndex);
    }

    public async Task<QuestionResponse?> GetNextQuestionAsync(string identifier, Guid cellId)
    {
        var session = await ResolveAsync(identifier);
        if (session is null) return null;

        var cell = await db.LetterCells
            .FirstOrDefaultAsync(c => c.Id == cellId && c.SessionId == session.Id);

        if (cell is null) return null;

        var external = await externalQuestions.GetQuestionAsync(cell.Letter);
        if (external is not null)
            return new QuestionResponse(Guid.Empty, cell.Letter, external.Value.Question, external.Value.Answer, cell.QuestionIndex, 1);

        var total = await db.Questions.CountAsync(q => q.Letter == cell.Letter);
        if (total == 0) return null;

        cell.QuestionIndex = (cell.QuestionIndex + 1) % total;
        await db.SaveChangesAsync();

        return await GetQuestionAtIndex(cell.Letter, cell.QuestionIndex);
    }

    private async Task<GameSession?> ResolveAsync(string identifier)
    {
        if (Guid.TryParse(identifier, out var guid))
            return await db.Sessions.FirstOrDefaultAsync(s => s.Id == guid);
        return await db.Sessions.FirstOrDefaultAsync(s => s.RoomCode == identifier);
    }

    private async Task<GameSession?> ResolveWithCellsAsync(string identifier)
    {
        if (Guid.TryParse(identifier, out var guid))
            return await db.Sessions.Include(s => s.LetterCells)
                .FirstOrDefaultAsync(s => s.Id == guid && s.Status == SessionStatus.Active);
        return await db.Sessions.Include(s => s.LetterCells)
            .FirstOrDefaultAsync(s => s.RoomCode == identifier && s.Status == SessionStatus.Active);
    }

    private async Task<QuestionResponse?> GetQuestionAtIndex(string letter, int index)
    {
        var questions = await db.Questions
            .Where(q => q.Letter == letter)
            .OrderBy(q => q.SortOrder)
            .ToListAsync();

        if (questions.Count == 0) return null;

        var question = questions[index % questions.Count];

        return new QuestionResponse(
            question.Id,
            question.Letter,
            question.QuestionText,
            question.Answer,
            index,
            questions.Count
        );
    }
}
