using Hurof.Api.Data;
using Hurof.Api.DTOs.Buzzer;
using Hurof.Api.Entities;
using Hurof.Api.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Hurof.Api.Services;

public interface IBuzzerService
{
    Task<BuzzResponse?> BuzzAsync(string identifier, string playerName);
    Task<bool> ResetAsync(string identifier);
}

public class BuzzerService(AppDbContext db, IHubContext<GameHub> hubContext, ILeaderboardService leaderboard) : IBuzzerService
{
    public async Task<BuzzResponse?> BuzzAsync(string identifier, string playerName)
    {
        var session = await ResolveAsync(identifier);
        if (session is null || session.Status != SessionStatus.Active) return null;

        if (session.BuzzerLockedByPlayer is not null)
            return new BuzzResponse(false, session.BuzzerLockedByPlayer);

        session.BuzzerLockedByPlayer = playerName;
        session.BuzzerLockedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        leaderboard.SetCurrentContender(session.RoomCode, playerName);

        await hubContext.Clients.Group(session.RoomCode)
            .SendAsync("BuzzWinner", new { playerName, lockedAt = session.BuzzerLockedAt });

        return new BuzzResponse(true, playerName);
    }

    public async Task<bool> ResetAsync(string identifier)
    {
        var session = await ResolveAsync(identifier);
        if (session is null) return false;

        await leaderboard.RecordStreakResetForContenderAsync(session.RoomCode);

        session.BuzzerLockedByPlayer = null;
        session.BuzzerLockedAt = null;
        await db.SaveChangesAsync();

        await hubContext.Clients.Group(session.RoomCode)
            .SendAsync("BuzzerReset");

        return true;
    }

    private async Task<GameSession?> ResolveAsync(string identifier)
    {
        if (Guid.TryParse(identifier, out var guid))
            return await db.Sessions.FirstOrDefaultAsync(s => s.Id == guid);
        return await db.Sessions.FirstOrDefaultAsync(s => s.RoomCode == identifier);
    }
}
