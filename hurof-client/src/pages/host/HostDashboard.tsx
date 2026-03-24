import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RtlWrapper } from '../../components/layout/RtlWrapper';
import { HexGrid } from '../../components/hex/HexGrid';
import { QuestionCard } from '../../components/ui/QuestionCard';
import { SplashScreen } from '../../components/ui/SplashScreen';
import { GameOverBanner } from '../../components/ui/GameOverBanner';
import { EndGameDialog } from '../../components/ui/EndGameDialog';
import { ConnectionStatus } from '../../components/ui/ConnectionStatus';
import { useGameHub } from '../../hooks/useGameHub';
import { useGridScale } from '../../hooks/useGridScale';
import { queryKeys } from '../../lib/queryKeys';
import { createSession, deleteSession, resetSession, getSession } from '../../api/sessions';
import { setCellState, getQuestion, nextQuestion } from '../../api/letters';
import { resetBuzzer } from '../../api/buzzer';
import { getHubConnection } from '../../lib/signalr';
import type {
  BuzzWinnerEvent,
  GameOverEvent,
  GameResetEvent,
  LetterCellResponse,
  SessionResponse,
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
  const [config, setConfig] = useState<SessionConfig>({ gridSize: 5, team1Color: '#0013a3', team2Color: '#0099ff' });
  const [rejoinError, setRejoinError] = useState('');
  const hasJoinedAsHostRef = useRef(false);

  const activeCellId = cells.find(c => c.state === 'Active')?.id ?? null;
  const [gridContainer, setGridContainer] = useState<HTMLDivElement | null>(null);
  const gridScale = useGridScale(gridContainer, session?.gridSize ?? 5);

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
    onBuzzWinner: useCallback((e: BuzzWinnerEvent) => setBuzzWinner(e), []),
    onGameOver: useCallback((e: GameOverEvent) => setGameOver(e), []),
    onBuzzerReset: useCallback(() => setBuzzWinner(null), []),
    onGameReset: useCallback((e: GameResetEvent) => {
      setCells(e.cells);
      setGameOver(null);
      setBuzzWinner(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.question(session?.roomCode ?? '', '') });
    }, [queryClient, session?.roomCode]),
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
        navigate('/');
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

  const winningPath = gameOver?.winningPath
    ? new Set(gameOver.winningPath.map(p => `${p.row}-${p.col}`))
    : undefined;

  const [copiedTv, setCopiedTv] = useState(false);
  const [copiedPlayer, setCopiedPlayer] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const team1Score = cells.filter(c => c.state === 'AssignedTeam1').length;
  const team2Score = cells.filter(c => c.state === 'AssignedTeam2').length;

  const copyToClipboard = (path: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(`${window.location.origin}${path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  // --- Rejoin loading state ---
  if (rejoinRoomCode && !session && !rejoinError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">جارٍ تحميل الجلسة...</div>
      </div>
    );
  }

  // --- Create session form ---
  if (!session) {
    return (
      <RtlWrapper>
        <div className="portrait-overlay">
          <div className="portrait-overlay__icon">📱</div>
          <div className="portrait-overlay__text">
            يرجى تدوير الجهاز إلى الوضع الأفقي
            <br />
            <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 400 }}>Please rotate your device to landscape</span>
          </div>
        </div>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-sm font-bold transition-colors"
          >
            ← رجوع
          </button>
          <div className="w-full max-w-sm flex flex-col gap-5">
            <h1 className="text-3xl font-black text-amber-400 text-center">إعداد اللعبة</h1>
            {rejoinError && (
              <p className="text-red-400 text-sm text-center bg-red-900/30 border border-red-700 rounded-xl px-4 py-2">{rejoinError}</p>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-slate-400 text-sm">حجم الشبكة</label>
              <select
                value={config.gridSize}
                onChange={e => setConfig(p => ({ ...p, gridSize: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
              >
                {[3, 5, 7, 9].map(n => (
                  <option key={n} value={n}>{n}×{n}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-slate-400 text-sm">لون فريق ١</label>
                <input
                  type="color"
                  value={config.team1Color}
                  onChange={e => setConfig(p => ({ ...p, team1Color: e.target.value }))}
                  className="w-full h-12 rounded-xl cursor-pointer bg-slate-800 border border-slate-700"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-slate-400 text-sm">لون فريق ٢</label>
                <input
                  type="color"
                  value={config.team2Color}
                  onChange={e => setConfig(p => ({ ...p, team2Color: e.target.value }))}
                  className="w-full h-12 rounded-xl cursor-pointer bg-slate-800 border border-slate-700"
                />
              </div>
            </div>

            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-lg transition-colors disabled:opacity-50"
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
      <div className="portrait-overlay">
        <div className="portrait-overlay__icon">📱</div>
        <div className="portrait-overlay__text">
          يرجى تدوير الجهاز إلى الوضع الأفقي
          <br />
          <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 400 }}>Please rotate your device to landscape</span>
        </div>
      </div>
      <div className="game-board-root" style={{ height: '100vh', display: 'flex', overflow: 'hidden', backgroundColor: '#0f172a' }}>

        {/* ── Part 1: Sidebar (~22%) ── */}
        <div style={{ width: '22%' }} className="host-sidebar flex flex-col gap-3 p-4 bg-slate-800 border-l border-slate-700 overflow-y-auto">

          {/* Team scores */}
          <div className="flex flex-col gap-2">
            <div className="score-box flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ backgroundColor: session.team1Color + '28', border: `2px solid ${session.team1Color}` }}>
              <span className="text-white font-bold text-sm">فريق ١</span>
              <span className="score-number text-white font-black text-2xl">{team1Score}</span>
            </div>
            <div className="score-box flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ backgroundColor: session.team2Color + '28', border: `2px solid ${session.team2Color}` }}>
              <span className="text-white font-bold text-sm">فريق ٢</span>
              <span className="score-number text-white font-black text-2xl">{team2Score}</span>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl overflow-hidden border border-slate-700">
            <button
              onClick={() => setSidebarTab('game')}
              className={`flex-1 py-2 text-sm font-bold transition-colors ${sidebarTab === 'game' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
            >
              سؤال
            </button>
            <button
              onClick={() => setSidebarTab('players')}
              className={`flex-1 py-2 text-sm font-bold transition-colors ${sidebarTab === 'players' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
            >
              اللاعبون {players.length > 0 && `(${players.length})`}
            </button>
          </div>

          {sidebarTab === 'game' ? (
            <>
              {/* Buzz winner */}
              {buzzWinner && (
                <div className="flex flex-col gap-2 bg-amber-500/10 border border-amber-500 rounded-2xl p-4">
                  <div className="text-amber-400 text-xs font-bold uppercase tracking-wide">ضغط أول!</div>
                  <div className="text-white font-black text-xl">{buzzWinner.playerName}</div>
                  <button
                    onClick={handleResetBuzzer}
                    className="w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-bold transition-colors"
                  >
                    إعادة الطارئ
                  </button>
                </div>
              )}

              {/* Question / placeholder */}
              <div className="flex-1">
                {activeCellId && questionLoading ? (
                  <div className="question-card bg-slate-800 rounded-2xl p-5 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : activeCellId && (question || questionError || nextQMutation.error) ? (
                  (questionError || nextQMutation.error) ? (
                    <div className="question-card bg-slate-800 rounded-2xl p-5 flex flex-col gap-4 w-full">
                      <div className="bg-red-900/50 border border-red-600 rounded-xl p-3 text-red-300 text-sm text-center">
                        {extractApiError(questionError ?? nextQMutation.error)}
                      </div>
                      <button
                        onClick={() => nextQMutation.mutate()}
                        disabled={nextQMutation.isPending}
                        className="w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors disabled:opacity-50"
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
                  <div className="letter-placeholder bg-slate-700/50 rounded-2xl p-5 text-slate-500 text-center text-sm">
                    اختر حرفاً من الشبكة
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Players list */
            <div className="flex-1 flex flex-col gap-2">
              {players.length === 0 ? (
                <div className="bg-slate-700/50 rounded-2xl p-5 text-slate-500 text-center text-sm">
                  لا يوجد لاعبون متصلون
                </div>
              ) : (
                players.map((name, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-700/50 rounded-xl px-4 py-2.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="text-white font-bold text-sm">{name}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Connection status */}
          <ConnectionStatus state={connectionState} />

          {/* Copy links */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => copyToClipboard(`/tv/${session.roomCode}`, setCopiedTv)}
              className="copy-btn w-full px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-bold transition-colors flex items-center justify-between"
            >
              <span className="text-slate-300">رابط الشاشة</span>
              <span style={{ color: copiedTv ? '#4ade80' : '#f59e0b' }}>{copiedTv ? '✓ تم النسخ' : 'نسخ'}</span>
            </button>
            <button
              onClick={() => copyToClipboard(`/play/${session.roomCode}`, setCopiedPlayer)}
              className="copy-btn w-full px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-bold transition-colors flex items-center justify-between"
            >
              <span className="text-slate-300">رابط اللاعبين</span>
              <span style={{ color: copiedPlayer ? '#4ade80' : '#f59e0b' }}>{copiedPlayer ? '✓ تم النسخ' : 'نسخ'}</span>
            </button>
          </div>

          {/* End game */}
          <button
            onClick={() => setShowEndConfirm(true)}
            disabled={endMutation.isPending}
            className="w-full py-2.5 rounded-xl bg-red-900/50 hover:bg-red-800 text-red-400 text-sm font-bold transition-colors disabled:opacity-50"
          >
            إنهاء اللعبة
          </button>
        </div>

        {/* ── Part 2: Grid (~78%) ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top strip — team 1 + room code */}
          <div className="host-strip" style={{ height: 48, backgroundColor: session.team1Color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700 }}>رمز الغرفة</span>
            <span style={{ color: '#fff', fontSize: 20, fontWeight: 900, letterSpacing: '0.15em' }}>{session.roomCode}</span>
          </div>

          {/* Grid area */}
          <div ref={setGridContainer} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#0f172a' }}>
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
          <div className="host-strip" style={{ height: 48, backgroundColor: session.team2Color, flexShrink: 0 }} />
        </div>
      </div>

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
    </RtlWrapper>
  );
}
