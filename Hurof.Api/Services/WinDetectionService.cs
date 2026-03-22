using Hurof.Api.DTOs.Letters;
using Hurof.Api.Entities;

namespace Hurof.Api.Services;

public record WinResult(int WinnerTeam, List<GridPosition> Path);

public interface IWinDetectionService
{
    WinResult? DetectWin(IEnumerable<LetterCell> cells, int gridSize);
}

public class WinDetectionService : IWinDetectionService
{
    public WinResult? DetectWin(IEnumerable<LetterCell> cells, int gridSize)
    {
        var cellList = cells.ToList();

        var team1Cells = cellList
            .Where(c => c.State == LetterState.AssignedTeam1)
            .Select(c => (c.Row, c.Col))
            .ToHashSet();

        var team2Cells = cellList
            .Where(c => c.State == LetterState.AssignedTeam2)
            .Select(c => (c.Row, c.Col))
            .ToHashSet();

        // Team 1: top (row 0) ↔ bottom (row gridSize-1) — bidirectional
        var path1 = FindPath(team1Cells, gridSize, startEdge: c => c.Row == 0, isGoal: c => c.Row == gridSize - 1)
                 ?? FindPath(team1Cells, gridSize, startEdge: c => c.Row == gridSize - 1, isGoal: c => c.Row == 0);
        if (path1 != null)
            return new WinResult(1, path1);

        // Team 2: left (col 0) ↔ right (col gridSize-1) — bidirectional
        var path2 = FindPath(team2Cells, gridSize, startEdge: c => c.Col == 0, isGoal: c => c.Col == gridSize - 1)
                 ?? FindPath(team2Cells, gridSize, startEdge: c => c.Col == gridSize - 1, isGoal: c => c.Col == 0);
        if (path2 != null)
            return new WinResult(2, path2);

        return null;
    }

    private static List<GridPosition>? FindPath(
        HashSet<(int Row, int Col)> ownedCells,
        int gridSize,
        Func<(int Row, int Col), bool> startEdge,
        Func<(int Row, int Col), bool> isGoal)
    {
        var queue = new Queue<(int Row, int Col)>();
        var visited = new HashSet<(int Row, int Col)>();
        var parent = new Dictionary<(int Row, int Col), (int Row, int Col)?>();

        foreach (var cell in ownedCells.Where(startEdge))
        {
            queue.Enqueue(cell);
            visited.Add(cell);
            parent[cell] = null;
        }

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();

            if (isGoal(current))
                return ReconstructPath(parent, current);

            foreach (var neighbor in GetHexNeighbors(current.Row, current.Col, gridSize))
            {
                if (ownedCells.Contains(neighbor) && !visited.Contains(neighbor))
                {
                    visited.Add(neighbor);
                    parent[neighbor] = current;
                    queue.Enqueue(neighbor);
                }
            }
        }

        return null;
    }

    private static IEnumerable<(int Row, int Col)> GetHexNeighbors(int row, int col, int gridSize)
    {
        // Pointy-top hex grid with odd-row offset
        (int dr, int dc)[] offsets = (row % 2 == 0)
            ? [(-1, 0), (-1, 1), (0, -1), (0, 1), (1, 0), (1, 1)]
            : [(-1, -1), (-1, 0), (0, -1), (0, 1), (1, -1), (1, 0)];

        foreach (var (dr, dc) in offsets)
        {
            var nr = row + dr;
            var nc = col + dc;
            if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize)
                yield return (nr, nc);
        }
    }

    private static List<GridPosition> ReconstructPath(
        Dictionary<(int Row, int Col), (int Row, int Col)?> parent,
        (int Row, int Col) goal)
    {
        var path = new List<GridPosition>();
        (int Row, int Col)? current = goal;

        while (current.HasValue)
        {
            path.Add(new GridPosition(current.Value.Row, current.Value.Col));
            current = parent[current.Value];
        }

        path.Reverse();
        return path;
    }
}
