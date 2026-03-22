import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RtlWrapper } from '../../components/layout/RtlWrapper';
import { HexGrid } from '../../components/hex/HexGrid';
import { BuzzBanner } from '../../components/ui/BuzzBanner';
import { GameOverBanner } from '../../components/ui/GameOverBanner';
import { TeamScoreBadge } from '../../components/ui/TeamScoreBadge';
import { useGameHub } from '../../hooks/useGameHub';
import { queryKeys } from '../../lib/queryKeys';
import { getSession } from '../../api/sessions';
import { playBuzzer, unlockAudio } from '../../lib/buzzerSound';
import type { BuzzWinnerEvent, GameOverEvent, LetterCellResponse } from '../../types/api';

export function TvDisplayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [cells, setCells] = useState<LetterCellResponse[]>([]);
  const [buzzWinner, setBuzzWinner] = useState<BuzzWinnerEvent | null>(null);
  const [gameOver, setGameOver] = useState<GameOverEvent | null>(null);

  const { data: session } = useQuery({
    queryKey: queryKeys.session(sessionId!),
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (session) setCells(session.cells);
  }, [session]);

  // Unlock AudioContext on first interaction so buzzer sound works
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useGameHub(sessionId ?? '', {
    onGridUpdate: useCallback((cell: LetterCellResponse) => {
      setCells(prev => prev.map(c => c.id === cell.id ? cell : c));
    }, []),
    onBuzzWinner: useCallback((e: BuzzWinnerEvent) => { playBuzzer(); setBuzzWinner(e); }, []),
    onGameOver: useCallback((e: GameOverEvent) => setGameOver(e), []),
    onBuzzerReset: useCallback(() => setBuzzWinner(null), []),
  });

  const winningPath = gameOver?.winningPath
    ? new Set(gameOver.winningPath.map(p => `${p.row}-${p.col}`))
    : undefined;

  const team1Score = cells.filter(c => c.state === 'AssignedTeam1').length;
  const team2Score = cells.filter(c => c.state === 'AssignedTeam2').length;

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-xl">جارٍ التحميل...</div>
      </div>
    );
  }

  return (
    <RtlWrapper>
      <div className="min-h-screen bg-slate-900 overflow-hidden flex flex-col">
        {/* Score bar */}
        <div className="flex items-center justify-between px-10 py-4 bg-slate-800">
          <TeamScoreBadge label="فريق ١" score={team1Score} color={session.team1Color} />
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-3xl font-black text-amber-400">حروف</h1>
            <div className="flex items-center gap-2 bg-slate-700 px-4 py-1.5 rounded-xl border border-slate-600">
              <span className="text-slate-400 text-sm font-bold">رمز الغرفة</span>
              <span className="text-white font-black text-2xl tracking-widest">{session.roomCode}</span>
            </div>
          </div>
          <TeamScoreBadge label="فريق ٢" score={team2Score} color={session.team2Color} />
        </div>

        {/* Grid — centred, fills remaining space */}
        <div className="flex-1 flex items-center justify-center p-8">
          <HexGrid
            cells={cells}
            gridSize={session.gridSize}
            team1Color={session.team1Color}
            team2Color={session.team2Color}
            winningPath={winningPath}
            interactive={false}
          />
        </div>
      </div>

      {buzzWinner && <BuzzBanner playerName={buzzWinner.playerName} />}
      {gameOver && (
        <GameOverBanner
          winnerTeam={gameOver.winnerTeam}
          team1Color={session.team1Color}
          team2Color={session.team2Color}
        />
      )}
    </RtlWrapper>
  );
}
