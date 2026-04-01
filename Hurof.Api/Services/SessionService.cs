using Hurof.Api.Data;
using Hurof.Api.DTOs.Letters;
using Hurof.Api.DTOs.Sessions;
using Hurof.Api.Entities;
using Hurof.Api.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Hurof.Api.Services;

public interface ISessionService
{
    Task<SessionResponse> CreateSessionAsync(CreateSessionRequest request);
    Task<SessionResponse?> GetSessionAsync(string identifier);
    Task<bool> EndSessionAsync(string identifier);
    Task<bool> ResetSessionAsync(string identifier);
}

public class SessionService(
    AppDbContext db,
    IGridGeneratorService gridGenerator,
    IHubContext<GameHub> hubContext,
    ILeaderboardService leaderboard) : ISessionService
{
    public async Task<SessionResponse> CreateSessionAsync(CreateSessionRequest request)
    {
        var session = new GameSession
        {
            Id = Guid.NewGuid(),
            RoomCode = await GenerateUniqueRoomCodeAsync(),
            GridSize = request.GridSize,
            Team1Color = request.Team1Color,
            Team2Color = request.Team2Color,
            CreatedAt = DateTime.UtcNow
        };

        var cells = gridGenerator.GenerateGrid(session.Id, request.GridSize);
        session.LetterCells = cells;

        db.Sessions.Add(session);
        await db.SaveChangesAsync();

        return MapToResponse(session);
    }

    public async Task<SessionResponse?> GetSessionAsync(string identifier)
    {
        var session = await ResolveSessionAsync(identifier);
        return session is null ? null : MapToResponse(session);
    }

    public async Task<bool> EndSessionAsync(string identifier)
    {
        var session = await ResolveSessionAsync(identifier);
        if (session is null) return false;

        var finalLeaderboard = leaderboard.GetLeaderboard(session.RoomCode);
        await hubContext.Clients.Group(session.RoomCode)
            .SendAsync("GameOver", new { winnerTeam = (int?)null, winningPath = (object?)null, leaderboard = finalLeaderboard });

        leaderboard.ClearRoom(session.RoomCode);
        db.Sessions.Remove(session);
        await db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ResetSessionAsync(string identifier)
    {
        var session = await ResolveSessionAsync(identifier);
        if (session is null) return false;

        var oldCells = db.LetterCells.Where(c => c.SessionId == session.Id);
        db.LetterCells.RemoveRange(oldCells);

        var newCells = gridGenerator.GenerateGrid(session.Id, session.GridSize);
        db.LetterCells.AddRange(newCells);

        session.Status = SessionStatus.Active;
        session.WinnerTeam = null;
        session.BuzzerLockedByPlayer = null;
        session.BuzzerLockedAt = null;

        leaderboard.ClearRoom(session.RoomCode);
        await db.SaveChangesAsync();

        var cellResponses = newCells.Select(c =>
            new LetterCellResponse(c.Id, c.Row, c.Col, c.Letter, c.State.ToString())).ToList();

        await hubContext.Clients.Group(session.RoomCode)
            .SendAsync("GameReset", new { cells = cellResponses });

        return true;
    }

    private async Task<GameSession?> ResolveSessionAsync(string identifier)
    {
        if (Guid.TryParse(identifier, out var guid))
            return await db.Sessions.Include(s => s.LetterCells)
                .FirstOrDefaultAsync(s => s.Id == guid);

        return await db.Sessions.Include(s => s.LetterCells)
            .FirstOrDefaultAsync(s => s.RoomCode == identifier);
    }

    private async Task<string> GenerateUniqueRoomCodeAsync()
    {
        string code;
        do
        {
            code = Random.Shared.Next(100000, 1000000).ToString();
        } while (await db.Sessions.AnyAsync(s => s.RoomCode == code));
        return code;
    }

    private static SessionResponse MapToResponse(GameSession session) => new(
        session.Id,
        session.RoomCode,
        session.GridSize,
        session.Status.ToString(),
        session.Team1Color,
        session.Team2Color,
        session.WinnerTeam,
        session.BuzzerLockedByPlayer,
        session.BuzzerLockedAt,
        session.LetterCells.Select(c => new LetterCellResponse(c.Id, c.Row, c.Col, c.Letter, c.State.ToString())).ToList()
    );
}
