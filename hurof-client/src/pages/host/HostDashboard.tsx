import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RtlWrapper } from '../../components/layout/RtlWrapper';
import { HexGrid } from '../../components/hex/HexGrid';
import { QuestionCard } from '../../components/ui/QuestionCard';
import { SplashScreen } from '../../components/ui/SplashScreen';
import { GameOverBanner } from '../../components/ui/GameOverBanner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useGameHub } from '../../hooks/useGameHub';
import { queryKeys } from '../../lib/queryKeys';
import { createSession, deleteSession } from '../../api/sessions';
import { setCellState, getQuestion, nextQuestion } from '../../api/letters';
import { resetBuzzer } from '../../api/buzzer';
import type {
  BuzzWinnerEvent,
  GameOverEvent,
  LetterCellResponse,
  SessionResponse,
} from '../../types/api';

interface SessionConfig {
  gridSize: number;
  team1Color: string;
  team2Color: string;
}

const HEX_W_N = 110;
const HEX_H_N = HEX_W_N * 1.1547;
const HEX_ROW_STEP_N = HEX_H_N * 0.75 - 1;
const EDGE_TOTAL = (12 + 6) * 2;

function computeNaturalSize(gridSize: number) {
  return {
    w: gridSize * HEX_W_N + HEX_W_N / 2 + EDGE_TOTAL,
    h: HEX_ROW_STEP_N * gridSize + (HEX_H_N - HEX_ROW_STEP_N) + EDGE_TOTAL,
  };
}

function useGridScale(el: HTMLDivElement | null, gridSize: number) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (!el) return;
    const { w, h } = computeNaturalSize(gridSize);
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setScale(Math.max(Math.min(width / w, height / h, 1), 0.3));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [el, gridSize]);
  return scale;
}

export function HostDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [splash, setSplash] = useState(false);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [cells, setCells] = useState<LetterCellResponse[]>([]);
  const [buzzWinner, setBuzzWinner] = useState<BuzzWinnerEvent | null>(null);
  const [gameOver, setGameOver] = useState<GameOverEvent | null>(null);
  const [config, setConfig] = useState<SessionConfig>({ gridSize: 5, team1Color: '#e74c3c', team2Color: '#3498db' });

  const activeCellId = cells.find(c => c.state === 'Active')?.id ?? null;
  const [gridContainer, setGridContainer] = useState<HTMLDivElement | null>(null);
  const gridScale = useGridScale(gridContainer, session?.gridSize ?? 5);

  useEffect(() => {
    if (!session) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    const deleteOnLeave = () => {
      fetch(`${import.meta.env.VITE_API_BASE ?? 'http://localhost:5000'}/api/sessions/${session.id}`, {
        method: 'DELETE',
        keepalive: true,
      });
    };
    window.addEventListener('beforeunload', warn);
    window.addEventListener('pagehide', deleteOnLeave);
    return () => {
      window.removeEventListener('beforeunload', warn);
      window.removeEventListener('pagehide', deleteOnLeave);
    };
  }, [session]);

  // Question query — only runs when there's an active cell
  const { data: question } = useQuery({
    queryKey: queryKeys.question(session?.roomCode ?? '', activeCellId ?? ''),
    queryFn: () => getQuestion(session!.roomCode, activeCellId!),
    enabled: !!session && !!activeCellId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // SignalR
  useGameHub(session?.roomCode ?? '', {
    onGridUpdate: useCallback((cell: LetterCellResponse) => {
      setCells(prev => prev.map(c => c.id === cell.id ? cell : c));
    }, []),
    onBuzzWinner: useCallback((e: BuzzWinnerEvent) => setBuzzWinner(e), []),
    onGameOver: useCallback((e: GameOverEvent) => {
      setGameOver(e);
    }, []),
    onBuzzerReset: useCallback(() => setBuzzWinner(null), []),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: () => createSession(config),
    onSuccess: (data) => {
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
      navigate('/', { replace: true });
    },
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
            {activeCellId && question ? (
              <QuestionCard
                question={question}
                onNextQuestion={() => nextQMutation.mutate()}
                onAssignTeam1={() => handleAssign(1)}
                onAssignTeam2={() => handleAssign(2)}
                team1Color={session.team1Color}
                team2Color={session.team2Color}
                isLoading={nextQMutation.isPending}
              />
            ) : (
              <div className="letter-placeholder bg-slate-700/50 rounded-2xl p-5 text-slate-500 text-center text-sm">
                اختر حرفاً من الشبكة
              </div>
            )}
          </div>

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
          {/* Top strip — team 1 */}
          <div className="host-strip" style={{ height: 48, backgroundColor: session.team1Color, flexShrink: 0 }} />

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
          onBack={() => navigate('/')}
        />
      )}

      {showEndConfirm && (
        <ConfirmDialog
          message="هل أنت متأكد من إنهاء اللعبة؟ سيتم حذف الجلسة نهائياً."
          confirmLabel="إنهاء"
          cancelLabel="إلغاء"
          danger
          onConfirm={() => { setShowEndConfirm(false); endMutation.mutate(); }}
          onCancel={() => setShowEndConfirm(false)}
        />
      )}
    </RtlWrapper>
  );
}
