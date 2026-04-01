import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RtlWrapper } from '../../components/layout/RtlWrapper';
import { HexGrid } from '../../components/hex/HexGrid';
import { BuzzBanner } from '../../components/ui/BuzzBanner';
import { GameOverBanner } from '../../components/ui/GameOverBanner';
import { TimerOverlay } from '../../components/ui/TimerOverlay';
import { TeamScoreBadge } from '../../components/ui/TeamScoreBadge';
import { LeaderboardPanel } from '../../components/ui/LeaderboardPanel';
import { GameEndLeaderboardOverlay } from '../../components/ui/GameEndLeaderboardOverlay';
import { useGameHub } from '../../hooks/useGameHub';
import { useGridScale } from '../../hooks/useGridScale';
import { queryKeys } from '../../lib/queryKeys';
import { getSession } from '../../api/sessions';
import type { BuzzWinnerEvent, GameOverEvent, GameResetEvent, LeaderboardEntry, LeaderboardUpdatedEvent, LetterCellResponse, TimerStartedEvent } from '../../types/api';

export function TvDisplayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();
  const [cells, setCells]                 = useState<LetterCellResponse[]>([]);
  const [buzzWinner, setBuzzWinner]       = useState<BuzzWinnerEvent | null>(null);
  const [gameOver, setGameOver]           = useState<GameOverEvent | null>(null);
  const [leaderboard, setLeaderboard]     = useState<LeaderboardEntry[]>([]);
  const [gridContainer, setGridContainer] = useState<HTMLDivElement | null>(null);

  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [timerPhase, setTimerPhase]   = useState<1 | 2 | null>(null);
  const [timerTotal, setTimerTotal]   = useState(0);
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
    onBuzzWinner:  useCallback((e: BuzzWinnerEvent) => setBuzzWinner(e), []),
    onGameOver: useCallback((e: GameOverEvent) => {
      setGameOver(e);
      if (e.leaderboard) setLeaderboard(e.leaderboard);
    }, []),
    onBuzzerReset: useCallback(() => { setBuzzWinner(null); clearTvTimer(); }, [clearTvTimer]),
    onGameReset:   useCallback((e: GameResetEvent) => {
      setCells(e.cells); setGameOver(null); setBuzzWinner(null); setLeaderboard([]); clearTvTimer();
    }, [clearTvTimer]),
    onLeaderboardUpdated: useCallback((e: LeaderboardUpdatedEvent) => setLeaderboard(e.entries), []),
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
    onSessionEnded: useCallback(() => setSessionEndedCountdown(5), []),
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
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--void)' }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid rgba(201,168,76,0.2)',
            borderTopColor: 'var(--gold)',
            animation: 'spin 1s linear infinite',
          }}
          role="status"
          aria-label="جارٍ التحميل"
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <RtlWrapper>
      <div
        className="game-board-root"
        style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--void)' }}
      >
        {/* ── Score bar ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          background: 'rgba(2,2,3,0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 1px 0 rgba(201,168,76,0.08)',
          paddingTop:    'calc(0.6rem + env(safe-area-inset-top, 0px))',
          paddingBottom: '0.6rem',
          paddingLeft:   'calc(1rem + env(safe-area-inset-left, 0px))',
          paddingRight:  'calc(1rem + env(safe-area-inset-right, 0px))',
        }}>
          <div className="flex items-center gap-2.5">
            <TeamScoreBadge label="فريق ١" score={team1Score} color={session.team1Color} />
          </div>

          {/* Center: logo + room code */}
          <div className="flex items-center gap-3">
            <span style={{
              fontFamily: "'Amiri', serif",
              fontSize: '1.4rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold-2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              حروف
            </span>
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl"
              style={{
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.2)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span className="text-xs font-arabic" style={{ color: 'var(--cream-2)', opacity: 0.6 }}>
                غرفة
              </span>
              <span className="font-black text-base tracking-widest font-arabic" style={{ color: 'var(--gold)', letterSpacing: '0.12em' }}>
                {session.roomCode}
              </span>
            </div>
          </div>

          <TeamScoreBadge label="فريق ٢" score={team2Score} color={session.team2Color} />
        </div>

        {/* ── Grid + Leaderboard row ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Grid — fills most of the space */}
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

          {/* Leaderboard sidebar */}
          <div
            style={{
              width: 180,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              padding: '0.75rem 0.5rem',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(2,2,3,0.6)',
              backdropFilter: 'blur(12px)',
              overflowY: 'auto',
            }}
          >
            <LeaderboardPanel entries={leaderboard} />
          </div>
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
      {gameOver && leaderboard.length > 0 && (
        <GameEndLeaderboardOverlay entries={leaderboard} />
      )}
      {gameOver && leaderboard.length === 0 && (
        <GameOverBanner
          winnerTeam={gameOver.winnerTeam}
          team1Color={session.team1Color}
          team2Color={session.team2Color}
        />
      )}
      {connectionState !== 'Connected' && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center z-50 gap-4"
          style={{
            background: connectionState === 'Disconnected'
              ? 'rgba(2,2,3,0.90)'
              : 'rgba(2,2,3,0.72)',
            backdropFilter: 'blur(12px)',
            transition: 'background 0.4s ease',
          }}
        >
          <div
            style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '4px solid rgba(201,168,76,0.25)',
              borderTopColor: 'var(--gold)',
              animation: 'spin 1s linear infinite',
            }}
            aria-hidden="true"
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div
            className="font-bold font-arabic"
            style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', color: 'var(--cream)', textAlign: 'center' }}
          >
            {connectionState === 'Disconnected' ? 'انقطع الاتصال' : 'جارٍ إعادة الاتصال...'}
          </div>
        </div>
      )}

      {sessionEndedCountdown !== null && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center z-[60] gap-4"
          style={{ background: 'rgba(2,2,3,0.94)', backdropFilter: 'blur(16px)' }}
        >
          <div
            className="font-bold font-arabic"
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              color: 'var(--cream)',
              textShadow: '0 0 40px rgba(201,168,76,0.25)',
            }}
          >
            انتهت الجلسة
          </div>
          <div
            className="font-arabic"
            style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1.1rem' }}
          >
            العودة للرئيسية خلال{' '}
            <span className="timer-num font-bold" style={{ color: 'var(--gold-2)' }}>
              {sessionEndedCountdown}
            </span>{' '}
            ثوانٍ...
          </div>
        </div>
      )}
    </RtlWrapper>
  );
}
