using Hurof.Api.Entities;

namespace Hurof.Api.Services;

public interface IGridGeneratorService
{
    List<LetterCell> GenerateGrid(Guid sessionId, int gridSize);
}

public class GridGeneratorService : IGridGeneratorService
{
    private static readonly string[] ArabicLetters =
    [
        "أ", "ب", "ت", "ج", "ح", "خ", "د", "ر", "ز", "س",
        "ش", "ص", "ض", "ط", "ع", "غ", "ف", "ق", "ك", "ل",
        "م", "ن", "ه", "و", "ي"
    ];

    public List<LetterCell> GenerateGrid(Guid sessionId, int gridSize)
    {
        var totalCells = gridSize * gridSize;
        var letters = new List<string>(totalCells);

        while (letters.Count < totalCells)
        {
            var shuffled = ArabicLetters.OrderBy(_ => Random.Shared.Next()).ToList();
            letters.AddRange(shuffled);
        }

        letters = letters.Take(totalCells).ToList();

        var cells = new List<LetterCell>(totalCells);
        for (var row = 0; row < gridSize; row++)
        {
            for (var col = 0; col < gridSize; col++)
            {
                cells.Add(new LetterCell
                {
                    Id = Guid.NewGuid(),
                    SessionId = sessionId,
                    Row = row,
                    Col = col,
                    Letter = letters[row * gridSize + col],
                    State = LetterState.Unselected,
                    QuestionIndex = 0
                });
            }
        }

        return cells;
    }
}
