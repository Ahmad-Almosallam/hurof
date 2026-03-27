import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RtlWrapper } from '../../components/layout/RtlWrapper';
import { HexGrid } from '../../components/hex/HexGrid';
import { BuzzBanner } from '../../components/ui/BuzzBanner';
import { GameOverBanner } from '../../components/ui/GameOverBanner';
import { TimerOverlay } from '../../components/ui/TimerOverlay';
import { TeamScoreBadge } from '../../components/ui/TeamScoreBadge';
import { ConnectionStatus } from '../../components/ui/ConnectionStatus';
import { useGameHub } from '../../hooks/useGameHub';
import { useGridScale } from '../../hooks/useGridScale';
import { queryKeys } from '../../lib/queryKeys';
import { getSession } from '../../api/sessions';
import type { BuzzWinnerEvent, GameOverEvent, GameResetEvent, LetterCellResponse, TimerStartedEvent } from '../../types/api';

export function TvDisplayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cells, setCells] = useState<LetterCellResponse[]>([]);
  const [buzzWinner, setBuzzWinner] = useState<BuzzWinnerEvent | null>(null);
  const [gameOver, setGameOver] = useState<GameOverEvent | null>(null);
  const [gridContainer, setGridContainer] = useState<HTMLDivElement | null>(null);

  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [timerPhase, setTimerPhase] = useState<1 | 2 | null>(null);
  const [timerTotal, setTimerTotal] = useState(0);
  const tvTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sessionEndedCountdown, setSessionEndedCountdown] = useState<number | null>(null);

  const clearTvTimer = useCallback(() => {
    if (tvTimerRef.current) { clearInterval(tvTimerRef.current); tvTimerRef.current = null; }
    setTimerSecondsLeft(0);
    setTimerPhase(null);
  }, []);

  const { data: session, refetch } = useQuery({
    queryKey: queryKeys.session(sessionId!),
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const gridScale = useGridScale(gridContainer, session?.gridSize ?? 5);

  useEffect(() => {
    if (session) setCells(session.cells);
  }, [session]);


  const { connectionState } = useGameHub(sessionId ?? '', {
    onGridUpdate: useCallback((cell: LetterCellResponse) => {
      setCells(prev => prev.map(c => c.id === cell.id ? cell : c));
    }, []),
    onBuzzWinner: useCallback((e: BuzzWinnerEvent) => { setBuzzWinner(e); }, []),
    onGameOver: useCallback((e: GameOverEvent) => setGameOver(e), []),
    onBuzzerReset: useCallback(() => {
      setBuzzWinner(null);
      clearTvTimer();
    }, [clearTvTimer]),
    onGameReset: useCallback((e: GameResetEvent) => {
      setCells(e.cells);
      setGameOver(null);
      setBuzzWinner(null);
      clearTvTimer();
    }, [clearTvTimer]),
    onTimerStarted: useCallback((e: TimerStartedEvent) => {
      if (tvTimerRef.current) { clearInterval(tvTimerRef.current); tvTimerRef.current = null; }
      setTimerSecondsLeft(e.durationSeconds);
      setTimerTotal(e.durationSeconds);
      setTimerPhase(e.phase);
      let remaining = e.durationSeconds;
      tvTimerRef.current = setInterval(() => {
        remaining -= 1;
        setTimerSecondsLeft(remaining);
        if (remaining <= 0) {
          clearInterval(tvTimerRef.current!);
          tvTimerRef.current = null;
          setTimerSecondsLeft(0);
          setTimerPhase(null);
        }
      }, 1000);
    }, []),
    onReconnected: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.session(sessionId!) });
      refetch();
    }, [queryClient, sessionId, refetch]),
    onSessionEnded: useCallback(() => {
      setSessionEndedCountdown(5);
    }, []),
  });

  useEffect(() => {
    if (sessionEndedCountdown === null) return;
    if (sessionEndedCountdown <= 0) { navigate('/'); return; }
    const t = setTimeout(() => setSessionEndedCountdown(c => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [sessionEndedCountdown, navigate]);

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
      <div className="game-board-root" style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#0f172a' }}>
        {/* Score bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, backgroundColor: '#1e293b', paddingTop: 'calc(0.375rem + env(safe-area-inset-top, 0px))', paddingBottom: '0.375rem', paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))', paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))' }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-white text-sm font-bold px-2 py-1 rounded-lg hover:bg-slate-700 transition-colors"
            >
              ← رجوع
            </button>
            <TeamScoreBadge label="فريق ١" score={team1Score} color={session.team1Color} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base font-black text-amber-400">حروف</span>
            <div className="flex items-center gap-1.5 bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-600">
              <span className="text-slate-400 text-xs font-bold">رمز الغرفة</span>
              <span className="text-white font-black text-base tracking-widest">{session.roomCode}</span>
            </div>
            <ConnectionStatus state={connectionState} />
          </div>
          <TeamScoreBadge label="فريق ٢" score={team2Score} color={session.team2Color} />
        </div>

        {/* Grid — fills remaining space, scales to fit */}
        <div
          ref={setGridContainer}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          <HexGrid
            cells={cells}
            gridSize={session.gridSize}
            team1Color={session.team1Color}
            team2Color={session.team2Color}
            winningPath={winningPath}
            interactive={false}
            scale={gridScale}
          />
        </div>
      </div>

      {buzzWinner && (
        <BuzzBanner
          playerName={buzzWinner.playerName}
          timerSecondsLeft={timerSecondsLeft > 0 ? timerSecondsLeft : undefined}
          timerPhase={timerPhase}
        />
      )}
      {!buzzWinner && timerSecondsLeft > 0 && timerPhase !== null && (
        <TimerOverlay secondsLeft={timerSecondsLeft} totalSeconds={timerTotal} phase={timerPhase} />
      )}
      {gameOver && (
        <GameOverBanner
          winnerTeam={gameOver.winnerTeam}
          team1Color={session.team1Color}
          team2Color={session.team2Color}
        />
      )}
      {sessionEndedCountdown !== null && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 gap-4">
          <div className="text-5xl font-black text-white">انتهت الجلسة</div>
          <div className="text-slate-400 text-xl">العودة للرئيسية خلال {sessionEndedCountdown} ثوانٍ...</div>
        </div>
      )}
    </RtlWrapper>
  );
}
