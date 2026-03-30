import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RtlWrapper } from '../../components/layout/RtlWrapper';
import { HexGrid } from '../../components/hex/HexGrid';
import { QuestionCard } from '../../components/ui/QuestionCard';
import { SplashScreen } from '../../components/ui/SplashScreen';
import { GameOverBanner } from '../../components/ui/GameOverBanner';
import { EndGameDialog } from '../../components/ui/EndGameDialog';
import { TimerExpiredDialog } from '../../components/ui/TimerExpiredDialog';
import { ConnectionStatus } from '../../components/ui/ConnectionStatus';
import { MobileSettingsSheet } from '../../components/ui/MobileSettingsSheet';
import { useGameHub } from '../../hooks/useGameHub';
import { useGridScale } from '../../hooks/useGridScale';
import { queryKeys } from '../../lib/queryKeys';
import { createSession, deleteSession, resetSession, getSession } from '../../api/sessions';
import { setCellState, getQuestion, nextQuestion } from '../../api/letters';
import { resetBuzzer } from '../../api/buzzer';
import { getHubConnection } from '../../lib/signalr';
import { playTimerEnd, playBuzzer, playWinSound, unlockAudio } from '../../lib/buzzerSound';
import type {
  BuzzWinnerEvent,
  GameOverEvent,
  GameResetEvent,
  LetterCellResponse,
  SessionResponse,
  TimerStartedEvent,
} from '../../types/api';

function extractApiError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: { error?: string } } }).response?.data;
    if (data?.error) return data.error;
  }
  return 'حدث خطأ غير متوقع';
}

interface SessionConfig {
  gridSize: number;
  team1Color: string;
  team2Color: string;
}


export function HostDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const rejoinRoomCode = searchParams.get('roomCode');

  const [splash, setSplash] = useState(false);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [cells, setCells] = useState<LetterCellResponse[]>([]);
  const [buzzWinner, setBuzzWinner] = useState<BuzzWinnerEvent | null>(null);
  const [gameOver, setGameOver] = useState<GameOverEvent | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'game' | 'players'>('game');
  const [config, setConfig] = useState<SessionConfig>({ gridSize: 5, team1Color: '#D4702A', team2Color: '#2A8A8A' });
  const [rejoinError, setRejoinError] = useState('');
  const [hostTakenError, setHostTakenError] = useState('');
  const hasJoinedAsHostRef = useRef(false);

  // Timer state
  const [timerBuzzer, setTimerBuzzer] = useState(3);
  const [timerThink, setTimerThink] = useState(10);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [timerPhase, setTimerPhase] = useState<1 | 2 | null>(null);
  const [showTimerExpired, setShowTimerExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Stable refs so setInterval callbacks don't capture stale state
  const timerPhaseRef = useRef<1 | 2 | null>(null);
  const timerBuzzerRef = useRef(0);
  const timerThinkRef = useRef(0);
  const sessionRoomCodeRef = useRef('');
  timerBuzzerRef.current = timerBuzzer;
  timerThinkRef.current = timerThink;
  sessionRoomCodeRef.current = session?.roomCode ?? '';

  const activeCellId = cells.find(c => c.state === 'Active')?.id ?? null;
  const [gridContainer, setGridContainer] = useState<HTMLDivElement | null>(null);
  const gridScale = useGridScale(gridContainer, session?.gridSize ?? 5);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setTimerSecondsLeft(0);
    setTimerPhase(null);
    timerPhaseRef.current = null;
    setShowTimerExpired(false);
  }, []);

  const startTimer = useCallback((durationSeconds: number, phase: 1 | 2) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    timerPhaseRef.current = phase;
    setTimerPhase(phase);
    setTimerSecondsLeft(durationSeconds);
    setShowTimerExpired(false);

    let remaining = durationSeconds;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimerSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setTimerSecondsLeft(0);
        playTimerEnd();
        if (timerPhaseRef.current === 1) {
          setShowTimerExpired(true);
        }
        setTimerPhase(null);
        timerPhaseRef.current = null;
      }
    }, 1000);
  }, []);

  // Warn before leaving (but do NOT delete session — it persists for rejoin)
  useEffect(() => {
    if (!session) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [session]);

  // Rejoin existing session if ?roomCode param is present
  useEffect(() => {
    if (!rejoinRoomCode) return;
    getSession(rejoinRoomCode)
      .then(data => {
        setSession(data);
        setCells(data.cells);
        if (data.buzzerLockedByPlayer) {
          setBuzzWinner({ playerName: data.buzzerLockedByPlayer, lockedAt: data.buzzerLockedAt ?? '' });
        }
      })
      .catch(() => {
        localStorage.removeItem('hurof_host_room');
        setRejoinError('انتهت الجلسة أو غير موجودة');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unlock audio context on first user interaction
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Question query — only runs when there's an active cell
  const { data: question, error: questionError, isFetching: questionLoading } = useQuery({
    queryKey: queryKeys.question(session?.roomCode ?? '', activeCellId ?? ''),
    queryFn: () => getQuestion(session!.roomCode, activeCellId!),
    enabled: !!session && !!activeCellId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // SignalR
  const { connectionState } = useGameHub(session?.roomCode ?? '', {
    onGridUpdate: useCallback((cell: LetterCellResponse) => {
      setCells(prev => prev.map(c => c.id === cell.id ? cell : c));
    }, []),
    onBuzzWinner: useCallback((e: BuzzWinnerEvent) => {
      playBuzzer();
      setBuzzWinner(e);
      const t1 = timerBuzzerRef.current;
      const roomCode = sessionRoomCodeRef.current;
      if (t1 > 0 && roomCode) {
        startTimer(t1, 1);
        getHubConnection(roomCode)
          .invoke('BroadcastTimerStart', roomCode, t1, 1)
          .catch(() => {});
      }
    }, [startTimer]),
    onGameOver: useCallback((e: GameOverEvent) => { playWinSound().catch(() => {}); setGameOver(e); }, []),
    onBuzzerReset: useCallback(() => {
      setBuzzWinner(null);
      clearTimer();
    }, [clearTimer]),
    onGameReset: useCallback((e: GameResetEvent) => {
      setCells(e.cells);
      setGameOver(null);
      setBuzzWinner(null);
      clearTimer();
      queryClient.invalidateQueries({ queryKey: queryKeys.question(session?.roomCode ?? '', '') });
    }, [queryClient, session?.roomCode, clearTimer]),
    // TimerStarted is handled by host locally (hub sends to OthersInGroup only)
    onTimerStarted: useCallback((_e: TimerStartedEvent) => {}, []),
    onPlayerListUpdate: useCallback((list: string[]) => setPlayers(list), []),
    onReconnected: useCallback(async () => {
      if (!session?.roomCode) return;
      const fresh = await getSession(session.roomCode);
      setCells(fresh.cells);
      if (fresh.buzzerLockedByPlayer) {
        setBuzzWinner({ playerName: fresh.buzzerLockedByPlayer, lockedAt: fresh.buzzerLockedAt ?? '' });
      } else {
        setBuzzWinner(null);
      }
      // Re-claim host slot after reconnect
      hasJoinedAsHostRef.current = false;
    }, [session?.roomCode]),
  });

  // Claim host slot once connected (and after reconnects)
  useEffect(() => {
    if (!session?.roomCode || connectionState !== 'Connected' || hasJoinedAsHostRef.current) return;
    hasJoinedAsHostRef.current = true;
    const conn = getHubConnection(session.roomCode);
    conn.invoke<boolean>('JoinAsHost', session.roomCode).then(ok => {
      if (!ok) {
        setHostTakenError('هذه الغرفة لديها مضيف بالفعل');
        hasJoinedAsHostRef.current = false;
        setTimeout(() => navigate('/'), 3000);
      } else {
        conn.invoke('RequestPlayerList', session.roomCode).catch(() => {});
      }
    }).catch(() => {});
  }, [session?.roomCode, connectionState, navigate]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: () => createSession(config),
    onSuccess: (data) => {
      localStorage.setItem('hurof_host_room', data.roomCode);
      setSession(data);
      setCells(data.cells);
      setSplash(true);
    },
  });

  const stateMutation = useMutation({
    mutationFn: ({ cellId, state }: { cellId: string; state: string }) =>
      setCellState(session!.roomCode, cellId, state as never),
    onSuccess: (data) => {
      if (data.winDetected && data.winnerTeam != null) {
        setGameOver({ winnerTeam: data.winnerTeam, winningPath: data.winningPath });
      }
    },
  });

  const nextQMutation = useMutation({
    mutationFn: () => nextQuestion(session!.roomCode, activeCellId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.question(session!.roomCode, activeCellId!) });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => resetBuzzer(session!.roomCode),
  });

  const endMutation = useMutation({
    mutationFn: () => deleteSession(session!.id),
    onSuccess: () => {
      sessionStorage.removeItem('hurof_token');
      localStorage.removeItem('hurof_host_room');
      navigate('/', { replace: true });
    },
  });

  const handleEndGame = () => {
    if (!session) return;
    getHubConnection(session.roomCode).invoke('LeaveAsHost', session.roomCode).catch(() => {});
    endMutation.mutate();
  };

  const handleJoinAsPlayer = () => {
    if (!session) return;
    getHubConnection(session.roomCode).invoke('LeaveAsHost', session.roomCode).catch(() => {});
    localStorage.removeItem('hurof_host_room');
    navigate(`/play/${session.roomCode}`);
  };

  const newRoundMutation = useMutation({
    mutationFn: () => resetSession(session!.roomCode),
  });

  const handleCellClick = (cell: LetterCellResponse) => {
    if (!session) return;
    if (cell.state === 'Unselected') {
      stateMutation.mutate({ cellId: cell.id, state: 'Active' });
    } else if (cell.state === 'AssignedTeam1' || cell.state === 'AssignedTeam2') {
      stateMutation.mutate({ cellId: cell.id, state: 'Unselected' });
    }
  };

  const handleAssign = (team: 1 | 2) => {
    if (!activeCellId || !session) return;
    stateMutation.mutate({ cellId: activeCellId, state: `AssignedTeam${team}` });
    resetMutation.mutate();
  };

  const handleResetBuzzer = () => {
    resetMutation.mutate();
  };

  const handleTimerStartPhase2 = () => {
    setShowTimerExpired(false);
    const t2 = timerThinkRef.current;
    if (t2 > 0 && session) {
      startTimer(t2, 2);
      getHubConnection(session.roomCode)
        .invoke('BroadcastTimerStart', session.roomCode, t2, 2)
        .catch(() => {});
    }
  };

  const handleTimerResetBuzzer = () => {
    setShowTimerExpired(false);
    clearTimer();
    resetMutation.mutate();
  };

  const winningPath = gameOver?.winningPath
    ? new Set(gameOver.winningPath.map(p => `${p.row}-${p.col}`))
    : undefined;

  const [copiedTv, setCopiedTv] = useState(false);
  const [copiedPlayer, setCopiedPlayer] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Mobile layout
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  const team1Score = cells.filter(c => c.state === 'AssignedTeam1').length;
  const team2Score = cells.filter(c => c.state === 'AssignedTeam2').length;

  const kickPlayer = (playerName: string) => {
    if (!session) return;
    getHubConnection(session.roomCode).invoke('KickPlayer', session.roomCode, playerName).catch(() => {});
  };

  const copyToClipboard = (path: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(`${window.location.origin}${path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mobile breakpoint listener
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

// --- Splash ---
  if (splash && session) {
    return (
      <SplashScreen
        team1Color={session.team1Color}
        team2Color={session.team2Color}
        onDone={() => setSplash(false)}
      />
    );
  }

  // --- Host slot taken error ---
  if (hostTakenError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--void)' }}>
        <div className="text-center flex flex-col gap-4">
          <div className="text-4xl">🚫</div>
          <p className="font-bold text-lg" style={{ color: '#f87171' }}>{hostTakenError}</p>
          <p className="text-sm font-arabic" style={{ color: 'var(--cream-2)' }}>سيتم توجيهك للصفحة الرئيسية...</p>
        </div>
      </div>
    );
  }

  // --- Rejoin loading state ---
  if (rejoinRoomCode && !session && !rejoinError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--void)' }}>
        <div className="font-arabic" style={{ color: 'var(--cream-2)' }}>جارٍ تحميل الجلسة...</div>
      </div>
    );
  }

  // --- Create session form ---
  if (!session) {
    return (
      <RtlWrapper>
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--void)' }}>
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 px-4 py-2 rounded-xl text-sm font-bold font-arabic transition-all hover:brightness-110"
            style={{ background: 'var(--elevated)', color: 'var(--cream-2)', border: '1px solid var(--border-gold)' }}
          >
            ← رجوع
          </button>
          <div className="w-full max-w-sm flex flex-col gap-5" style={{ animation: 'float-in 0.5s ease both' }}>
            <h1
              className="text-center font-bold font-arabic"
              style={{ fontFamily: "'Amiri', serif", fontSize: '2.5rem', color: 'var(--gold-2)' }}
            >
              إعداد اللعبة
            </h1>
            {rejoinError && (
              <p
                className="text-sm text-center font-arabic rounded-xl px-4 py-2"
                style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                {rejoinError}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-arabic" style={{ color: 'var(--cream-2)' }}>حجم الشبكة</label>
              <select
                value={config.gridSize}
                onChange={e => setConfig(p => ({ ...p, gridSize: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl font-arabic outline-none transition-all"
                style={{
                  background: 'var(--surface)',
                  color: 'var(--cream)',
                  border: '1px solid var(--border-gold)',
                }}
              >
                {[3, 5, 7, 9].map(n => (
                  <option key={n} value={n}>{n}×{n}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm font-arabic" style={{ color: 'var(--cream-2)' }}>لون فريق ١</label>
                <input
                  type="color"
                  value={config.team1Color}
                  onChange={e => setConfig(p => ({ ...p, team1Color: e.target.value }))}
                  className="w-full h-12 rounded-xl cursor-pointer"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-gold)' }}
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm font-arabic" style={{ color: 'var(--cream-2)' }}>لون فريق ٢</label>
                <input
                  type="color"
                  value={config.team2Color}
                  onChange={e => setConfig(p => ({ ...p, team2Color: e.target.value }))}
                  className="w-full h-12 rounded-xl cursor-pointer"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-gold)' }}
                />
              </div>
            </div>

            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="w-full py-4 rounded-2xl font-black text-lg font-arabic transition-all hover:brightness-110 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), var(--gold-2))',
                color: '#07090F',
                boxShadow: '0 4px 24px var(--gold-glow)',
              }}
            >
              {createMutation.isPending ? 'جارٍ الإنشاء...' : 'ابدأ اللعبة'}
            </button>
          </div>
        </div>
      </RtlWrapper>
    );
  }

  // --- Main dashboard ---
  return (
    <RtlWrapper>
      {isMobile ? (
        /* ══════════════════════════════════
           MOBILE LAYOUT
           ══════════════════════════════════ */
        <div className="game-board-root" style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--void)' }}>

          {/* Mobile top bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))', paddingBottom: '0.5rem', paddingLeft: 'calc(0.6rem + env(safe-area-inset-left, 0px))', paddingRight: 'calc(0.6rem + env(safe-area-inset-right, 0px))', background: 'var(--surface)', borderBottom: '1px solid rgba(201,168,76,0.14)', flexShrink: 0 }}>
            <button
              onClick={() => setShowMobileSettings(true)}
              className="p-2 rounded-xl text-lg transition-all hover:brightness-110"
              style={{ background: 'var(--elevated)', border: '1px solid var(--border-gold)' }}
              aria-label="الإعدادات"
            >⚙️</button>
            <button
              onClick={() => copyToClipboard(`/tv/${session.roomCode}`, setCopiedTv)}
              className="flex-1 py-1.5 rounded-xl text-xs font-bold font-arabic transition-all hover:brightness-110"
              style={{ background: 'var(--elevated)', border: '1px solid var(--border-gold)', color: copiedTv ? '#4ade80' : 'var(--gold)' }}
            >{copiedTv ? '✓ شاشة' : '📺 شاشة'}</button>
            <button
              onClick={() => copyToClipboard(`/play/${session.roomCode}`, setCopiedPlayer)}
              className="flex-1 py-1.5 rounded-xl text-xs font-bold font-arabic transition-all hover:brightness-110"
              style={{ background: 'var(--elevated)', border: '1px solid var(--border-gold)', color: copiedPlayer ? '#4ade80' : 'var(--gold)' }}
            >{copiedPlayer ? '✓ لاعبون' : '👤 لاعبون'}</button>
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl" style={{ background: 'var(--elevated)', border: '1px solid var(--border-gold)' }}>
              <span className="text-xs" style={{ color: 'var(--cream-2)' }}>👥</span>
              <span className="font-black text-sm font-arabic" style={{ color: 'var(--cream)' }}>{players.length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl" style={{ background: 'var(--elevated)', border: '1px solid var(--border-gold)' }}>
              <span className="font-black text-sm font-arabic" style={{ color: session.team1Color }}>{team1Score}</span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>|</span>
              <span className="font-black text-sm font-arabic" style={{ color: session.team2Color }}>{team2Score}</span>
            </div>
          </div>

          {/* Room code strip */}
          <div style={{ height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--void)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            <span style={{ color: 'var(--cream-2)', fontSize: 10, fontWeight: 700, fontFamily: "'Cairo', sans-serif" }}>رمز الغرفة</span>
            <span style={{ color: 'var(--gold-2)', fontSize: 14, fontWeight: 900, letterSpacing: '0.15em', fontFamily: "'Cairo', sans-serif" }}>{session.roomCode}</span>
          </div>

          {/* Inline question — shown above grid when a cell is active */}
          {activeCellId && (
            <div style={{ flexShrink: 0, padding: '0.375rem 0.5rem', borderBottom: '1px solid rgba(201,168,76,0.14)', backgroundColor: 'var(--surface)' }}>
              {questionLoading ? (
                <div className="flex justify-center py-2">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (questionError || nextQMutation.error) ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-red-300 text-xs">{extractApiError(questionError ?? nextQMutation.error)}</div>
                  <button onClick={() => nextQMutation.mutate()} disabled={nextQMutation.isPending} className="px-2 py-1 rounded-lg bg-slate-700 text-slate-300 text-xs disabled:opacity-50">سؤال آخر</button>
                </div>
              ) : question ? (
                <QuestionCard
                  question={question}
                  onNextQuestion={() => nextQMutation.mutate()}
                  onAssignTeam1={() => handleAssign(1)}
                  onAssignTeam2={() => handleAssign(2)}
                  team1Color={session.team1Color}
                  team2Color={session.team2Color}
                  isLoading={nextQMutation.isPending}
                  compact
                />
              ) : null}
            </div>
          )}

          {/* Grid */}
          <div ref={setGridContainer} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <HexGrid
              cells={cells}
              gridSize={session.gridSize}
              team1Color={session.team1Color}
              team2Color={session.team2Color}
              winningPath={winningPath}
              onCellClick={handleCellClick}
              interactive={!gameOver}
              scale={gridScale}
            />
          </div>

          {/* Buzz winner bar */}
          {buzzWinner && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(201,168,76,0.1)', borderTop: '1px solid rgba(201,168,76,0.35)', flexShrink: 0 }}>
              <span className="font-black text-sm flex-1 font-arabic" style={{ color: 'var(--gold-2)' }}>🔔 {buzzWinner.playerName}</span>
              {timerPhase !== null && timerSecondsLeft > 0 && (
                <span className="font-black text-base font-arabic" style={{ color: timerSecondsLeft <= 5 ? '#f87171' : 'var(--gold)' }}>
                  {timerSecondsLeft}ث
                </span>
              )}
              <button
                onClick={handleResetBuzzer}
                className="px-3 py-1.5 rounded-xl text-xs font-bold font-arabic transition-all hover:brightness-110"
                style={{ background: 'var(--elevated)', color: 'var(--cream-2)', border: '1px solid var(--border-gold)' }}
              >
                إعادة ضبط
              </button>
            </div>
          )}

          {/* Bottom bar */}
          <div style={{ paddingTop: '0.5rem', paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))', paddingLeft: 'calc(0.75rem + env(safe-area-inset-left, 0px))', paddingRight: 'calc(0.75rem + env(safe-area-inset-right, 0px))', background: 'var(--surface)', borderTop: '1px solid rgba(201,168,76,0.14)', flexShrink: 0 }}>
            <button
              onClick={() => setShowEndConfirm(true)}
              disabled={endMutation.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-bold font-arabic transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              إنهاء اللعبة
            </button>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════
           DESKTOP LAYOUT
           ══════════════════════════════════ */
        <div className="game-board-root" style={{ height: '100vh', display: 'flex', overflow: 'hidden', backgroundColor: 'var(--void)' }}>

        {/* ── Part 1: Sidebar (~22%) ── */}
        <div style={{ width: '22%', background: 'var(--surface)', borderLeft: '1px solid rgba(201,168,76,0.14)' }} className="host-sidebar flex flex-col gap-3 p-4 overflow-y-auto">

          {/* Team scores */}
          <div className="flex flex-col gap-2">
            <div
              className="score-box flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: session.team1Color + '18', border: `1px solid ${session.team1Color}66`, boxShadow: `0 0 12px ${session.team1Color}22` }}
            >
              <span className="font-bold text-sm font-arabic" style={{ color: 'var(--cream)' }}>فريق ١</span>
              <span className="score-number font-black text-2xl font-arabic" style={{ color: session.team1Color }}>{team1Score}</span>
            </div>
            <div
              className="score-box flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: session.team2Color + '18', border: `1px solid ${session.team2Color}66`, boxShadow: `0 0 12px ${session.team2Color}22` }}
            >
              <span className="font-bold text-sm font-arabic" style={{ color: 'var(--cream)' }}>فريق ٢</span>
              <span className="score-number font-black text-2xl font-arabic" style={{ color: session.team2Color }}>{team2Score}</span>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-gold)' }}>
            <button
              onClick={() => setSidebarTab('game')}
              className="flex-1 py-2 text-sm font-bold font-arabic transition-all"
              style={sidebarTab === 'game'
                ? { background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))', color: '#07090F' }
                : { background: 'var(--elevated)', color: 'var(--cream-2)' }}
            >
              سؤال
            </button>
            <button
              onClick={() => setSidebarTab('players')}
              className="flex-1 py-2 text-sm font-bold font-arabic transition-all"
              style={sidebarTab === 'players'
                ? { background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))', color: '#07090F' }
                : { background: 'var(--elevated)', color: 'var(--cream-2)' }}
            >
              اللاعبون {players.length > 0 && `(${players.length})`}
            </button>
          </div>

          {sidebarTab === 'game' ? (
            <>
              {/* Buzz winner */}
              {buzzWinner && (
                <div className="flex flex-col gap-2 rounded-2xl p-4" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.35)' }}>
                  <div className="text-xs font-bold font-arabic uppercase tracking-wide" style={{ color: 'var(--gold-2)' }}>ضغط أول!</div>
                  <div className="font-black text-xl font-arabic" style={{ color: 'var(--cream)' }}>{buzzWinner.playerName}</div>
                  {timerPhase !== null && timerSecondsLeft > 0 && (
                    <div
                      className="text-center font-black text-3xl font-arabic"
                      style={{ color: timerSecondsLeft <= 5 ? '#f87171' : 'var(--gold)' }}
                    >
                      {timerSecondsLeft} ث
                    </div>
                  )}
                  <button
                    onClick={handleResetBuzzer}
                    className="w-full py-2 rounded-xl text-sm font-bold font-arabic transition-all hover:brightness-110"
                    style={{ background: 'var(--elevated)', color: 'var(--cream-2)', border: '1px solid var(--border-gold)' }}
                  >
                    إعادة ضبط الجرس
                  </button>
                </div>
              )}

              {/* Question / placeholder */}
              <div className="flex-1">
                {activeCellId && questionLoading ? (
                  <div className="question-card rounded-2xl p-5 flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-gold)' }}>
                    <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
                  </div>
                ) : activeCellId && (question || questionError || nextQMutation.error) ? (
                  (questionError || nextQMutation.error) ? (
                    <div className="question-card rounded-2xl p-5 flex flex-col gap-4 w-full" style={{ background: 'var(--surface)', border: '1px solid var(--border-gold)' }}>
                      <div className="rounded-xl p-3 text-sm text-center font-arabic" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                        {extractApiError(questionError ?? nextQMutation.error)}
                      </div>
                      <button
                        onClick={() => nextQMutation.mutate()}
                        disabled={nextQMutation.isPending}
                        className="w-full py-2 rounded-xl text-sm font-arabic transition-all hover:brightness-110 disabled:opacity-50"
                        style={{ background: 'var(--elevated)', color: 'var(--cream-2)', border: '1px solid var(--border-gold)' }}
                      >
                        سؤال آخر
                      </button>
                    </div>
                  ) : (
                    <QuestionCard
                      question={question!}
                      onNextQuestion={() => nextQMutation.mutate()}
                      onAssignTeam1={() => handleAssign(1)}
                      onAssignTeam2={() => handleAssign(2)}
                      team1Color={session.team1Color}
                      team2Color={session.team2Color}
                      isLoading={nextQMutation.isPending}
                    />
                  )
                ) : (
                  <div
                    className="letter-placeholder rounded-2xl p-5 text-center text-sm font-arabic"
                    style={{ background: 'rgba(201,168,76,0.05)', border: '1px dashed rgba(201,168,76,0.2)', color: 'var(--cream-2)' }}
                  >
                    اختر حرفاً من الشبكة
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Players list */
            <div className="flex-1 flex flex-col gap-2">
              {players.length === 0 ? (
                <div
                  className="rounded-2xl p-5 text-center text-sm font-arabic"
                  style={{ background: 'rgba(201,168,76,0.05)', border: '1px dashed rgba(201,168,76,0.2)', color: 'var(--cream-2)' }}
                >
                  لا يوجد لاعبون متصلون
                </div>
              ) : (
                players.map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                    style={{ background: 'var(--elevated)', border: '1px solid rgba(201,168,76,0.1)' }}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                    <span className="font-bold text-sm font-arabic flex-1" style={{ color: 'var(--cream)' }}>{name}</span>
                    <button
                      onClick={() => kickPlayer(name)}
                      className="text-base leading-none transition-all flex-shrink-0 hover:brightness-125"
                      style={{ color: 'var(--muted)' }}
                      aria-label="إزالة اللاعب"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Connection status */}
          <ConnectionStatus state={connectionState} />

          {/* Timer settings */}
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs text-center font-arabic" style={{ color: 'var(--cream-2)' }}>وقت الطارئ (ث)</label>
              <input
                type="number"
                min={0}
                value={timerBuzzer || ''}
                onChange={e => setTimerBuzzer(Math.max(0, Number(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-2 py-2 rounded-xl text-center text-sm font-arabic outline-none transition-all"
                style={{ background: 'var(--elevated)', color: 'var(--cream)', border: '1px solid var(--border-gold)' }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs text-center font-arabic" style={{ color: 'var(--cream-2)' }}>وقت الفريق (ث)</label>
              <input
                type="number"
                min={0}
                value={timerThink || ''}
                onChange={e => setTimerThink(Math.max(0, Number(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-2 py-2 rounded-xl text-center text-sm font-arabic outline-none transition-all"
                style={{ background: 'var(--elevated)', color: 'var(--cream)', border: '1px solid var(--border-gold)' }}
              />
            </div>
          </div>

          {/* Copy links */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => copyToClipboard(`/tv/${session.roomCode}`, setCopiedTv)}
              className="copy-btn w-full px-4 py-2.5 rounded-xl text-sm font-bold font-arabic transition-all hover:brightness-110 flex items-center justify-between"
              style={{ background: 'var(--elevated)', border: '1px solid var(--border-gold)' }}
            >
              <span style={{ color: 'var(--cream-2)' }}>رابط الشاشة</span>
              <span style={{ color: copiedTv ? '#4ade80' : 'var(--gold)' }}>{copiedTv ? '✓ تم النسخ' : 'نسخ'}</span>
            </button>
            <button
              onClick={() => copyToClipboard(`/play/${session.roomCode}`, setCopiedPlayer)}
              className="copy-btn w-full px-4 py-2.5 rounded-xl text-sm font-bold font-arabic transition-all hover:brightness-110 flex items-center justify-between"
              style={{ background: 'var(--elevated)', border: '1px solid var(--border-gold)' }}
            >
              <span style={{ color: 'var(--cream-2)' }}>رابط اللاعبين</span>
              <span style={{ color: copiedPlayer ? '#4ade80' : 'var(--gold)' }}>{copiedPlayer ? '✓ تم النسخ' : 'نسخ'}</span>
            </button>
          </div>

          {/* End game */}
          <button
            onClick={() => setShowEndConfirm(true)}
            disabled={endMutation.isPending}
            className="w-full py-2.5 rounded-xl text-sm font-bold font-arabic transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            إنهاء اللعبة
          </button>
        </div>

        {/* ── Part 2: Grid (~78%) ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top strip — team 1 + room code */}
          <div
            className="host-strip"
            style={{
              minHeight: 48,
              background: `linear-gradient(90deg, ${session.team1Color}CC, ${session.team1Color}AA)`,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingLeft: 'env(safe-area-inset-left, 0px)',
              paddingRight: 'env(safe-area-inset-right, 0px)',
              boxShadow: `0 2px 12px ${session.team1Color}44`,
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, fontFamily: "'Cairo', sans-serif" }}>رمز الغرفة</span>
            <span style={{ color: '#fff', fontSize: 20, fontWeight: 900, letterSpacing: '0.15em', fontFamily: "'Cairo', sans-serif" }}>{session.roomCode}</span>
          </div>

          {/* Grid area */}
          <div ref={setGridContainer} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'var(--void)' }}>
            <HexGrid
              cells={cells}
              gridSize={session.gridSize}
              team1Color={session.team1Color}
              team2Color={session.team2Color}
              winningPath={winningPath}
              onCellClick={handleCellClick}
              interactive={!gameOver}
              scale={gridScale}
            />
          </div>

          {/* Bottom strip — team 2 */}
          <div
            className="host-strip"
            style={{
              height: 48,
              background: `linear-gradient(90deg, ${session.team2Color}CC, ${session.team2Color}AA)`,
              flexShrink: 0,
              boxShadow: `0 -2px 12px ${session.team2Color}44`,
            }}
          />
        </div>
      </div>
      )}

      {/* Overlays */}
      {gameOver && (
        <GameOverBanner
          winnerTeam={gameOver.winnerTeam}
          team1Color={session.team1Color}
          team2Color={session.team2Color}
          onNewRound={() => newRoundMutation.mutate()}
          onBack={() => navigate('/')}
        />
      )}

      {showEndConfirm && (
        <EndGameDialog
          onCancel={() => setShowEndConfirm(false)}
          onJoinAsPlayer={() => { setShowEndConfirm(false); handleJoinAsPlayer(); }}
          onEndGame={() => { setShowEndConfirm(false); handleEndGame(); }}
          isEndingGame={endMutation.isPending}
        />
      )}

      {showTimerExpired && (
        <TimerExpiredDialog
          question={question ?? null}
          onStartPhase2={handleTimerStartPhase2}
          onResetBuzzer={handleTimerResetBuzzer}
          onAssignTeam1={() => { handleAssign(1); setShowTimerExpired(false); }}
          onAssignTeam2={() => { handleAssign(2); setShowTimerExpired(false); }}
          team1Color={session.team1Color}
          team2Color={session.team2Color}
        />
      )}

      {/* Mobile modals */}
      {isMobile && showMobileSettings && (
        <MobileSettingsSheet
          onClose={() => setShowMobileSettings(false)}
          timerBuzzer={timerBuzzer}
          timerThink={timerThink}
          setTimerBuzzer={setTimerBuzzer}
          setTimerThink={setTimerThink}
          players={players}
          onKickPlayer={kickPlayer}
          copiedTv={copiedTv}
          copiedPlayer={copiedPlayer}
          onCopyTv={() => copyToClipboard(`/tv/${session.roomCode}`, setCopiedTv)}
          onCopyPlayer={() => copyToClipboard(`/play/${session.roomCode}`, setCopiedPlayer)}
        />
      )}

    </RtlWrapper>
  );
}
