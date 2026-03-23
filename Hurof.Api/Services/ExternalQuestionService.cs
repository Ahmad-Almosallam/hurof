using System.Text.Json;
using Hurof.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Hurof.Api.Services;

public interface IExternalQuestionService
{
    Task<(string Question, string Answer)?> GetQuestionAsync(string letter);
    Task UpdatePhpSessionAsync(string newValue);
    Task<string> GetCurrentPhpSessionAsync();
}

public class ExternalQuestionService(
    IHttpClientFactory httpClientFactory,
    IMemoryCache cache,
    AppDbContext db) : IExternalQuestionService
{
    private const string CacheKey = "phpsessid";
    private const string ExternalApiBase = "https://sahamstudio.com/horoof/get_question.php";

    public async Task<(string Question, string Answer)?> GetQuestionAsync(string letter)
    {
        var sessionId = await GetPhpSessionIdAsync();
        if (string.IsNullOrWhiteSpace(sessionId)) return null;

        var client = httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Get, $"{ExternalApiBase}?letter={Uri.EscapeDataString(letter)}");
        request.Headers.Add("Cookie", $"PHPSESSID={sessionId}");

        HttpResponseMessage response;
        try { response = await client.SendAsync(request); }
        catch { throw new ExternalApiException("تعذّر الاتصال بالخادم الخارجي"); }

        var json = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        if (!response.IsSuccessStatusCode ||
            !root.TryGetProperty("status", out var statusProp) ||
            statusProp.GetString() != "success")
        {
            var msg = root.TryGetProperty("message", out var m) ? m.GetString() : null;
            throw new ExternalApiException(msg ?? "خطأ في الاتصال بالخادم الخارجي");
        }

        var question = root.TryGetProperty("question", out var q) ? q.GetString() : null;
        var answer = root.TryGetProperty("answer", out var a) ? a.GetString() : null;

        if (string.IsNullOrWhiteSpace(question) || string.IsNullOrWhiteSpace(answer))
            throw new ExternalApiException("الاستجابة من الخادم الخارجي غير مكتملة");

        return (question, answer);
    }

    public async Task UpdatePhpSessionAsync(string newValue)
    {
        var config = await db.PhpSessionConfigs.FirstAsync(c => c.Id == 1);
        config.PhpSessionId = newValue;
        config.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        cache.Remove(CacheKey);
        cache.Set(CacheKey, newValue, TimeSpan.FromDays(1));
    }

    public async Task<string> GetCurrentPhpSessionAsync()
    {
        return await GetPhpSessionIdAsync();
    }

    private async Task<string> GetPhpSessionIdAsync()
    {
        if (cache.TryGetValue(CacheKey, out string? cached) && cached is not null)
            return cached;

        var config = await db.PhpSessionConfigs.FirstOrDefaultAsync(c => c.Id == 1);
        var value = config?.PhpSessionId ?? string.Empty;

        cache.Set(CacheKey, value, TimeSpan.FromDays(1));
        return value;
    }
}
