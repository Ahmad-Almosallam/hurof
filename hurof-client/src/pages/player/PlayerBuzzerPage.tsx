import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock, Trophy, Loader, XCircle } from 'lucide-react';
import { RtlWrapper } from '../../components/layout/RtlWrapper';
import { GameOverBanner } from '../../components/ui/GameOverBanner';
import { ConnectionStatus } from '../../components/ui/ConnectionStatus';
import { GameEndLeaderboardOverlay } from '../../components/ui/GameEndLeaderboardOverlay';
import { useGameHub } from '../../hooks/useGameHub';
import { queryKeys } from '../../lib/queryKeys';
import { getSession } from '../../api/sessions';
import { buzz } from '../../api/buzzer';
import { getHubConnection } from '../../lib/signalr';
import type { BuzzWinnerEvent, GameOverEvent, GameResetEvent, LeaderboardEntry, LeaderboardUpdatedEvent } from '../../types/api';

export function PlayerBuzzerPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [playerName, setPlayerName]     = useState(() => sessionStorage.getItem('hurof_player') ?? '');
  const [nameSubmitted, setNameSubmitted] = useState(!!sessionStorage.getItem('hurof_player'));
  const [buzzWinner, setBuzzWinner]       = useState<BuzzWinnerEvent | null>(null);
  const [buzzFailed, setBuzzFailed]       = useState(false);
  const [gameOver, setGameOver]           = useState<GameOverEvent | null>(null);
  const [leaderboard, setLeaderboard]     = useState<LeaderboardEntry[]>([]);
  const [activeCellId, setActiveCellId]   = useState<string | null>(null);

  const { data: session, isLoading, refetch } = useQuery({
    queryKey: queryKeys.session(sessionId!),
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (session?.cells) {
      const active = session.cells.find(c => c.state === 'Active');
      setActiveCellId(active?.id ?? null);
    }
  }, [session]);


  useEffect(() => {
    if (!nameSubmitted || !sessionId || !playerName) return;
    const conn = getHubConnection(sessionId);
    if (conn.state === 'Connected') {
      conn.invoke('JoinAsPlayer', sessionId, playerName).catch(() => {});
    }
  }, [nameSubmitted, sessionId, playerName]);

  const { connectionState } = useGameHub(sessionId ?? '', {
    onConnected: useCallback(() => {
      if (nameSubmitted && playerName && sessionId) {
        getHubConnection(sessionId).invoke('JoinAsPlayer', sessionId, playerName).catch(() => {});
      }
    }, [nameSubmitted, playerName, sessionId]),
    onGridUpdate: useCallback((cell: { id: string; state: string }) => {
      if (cell.state === 'Active') setActiveCellId(cell.id);
      else setActiveCellId(prev => prev === cell.id ? null : prev);
    }, []),
    onBuzzWinner:  useCallback((e: BuzzWinnerEvent) => {
      setBuzzWinner(e);
      if (e.playerName === playerName) {
        navigator.vibrate?.([60, 40, 100]);
      }
    }, [playerName]),
    onGameOver: useCallback((e: GameOverEvent) => {
      setGameOver(e);
      if (e.leaderboard) setLeaderboard(e.leaderboard);
    }, []),
    onBuzzerReset: useCallback(() => setBuzzWinner(null), []),
    onGameReset:   useCallback((_e: GameResetEvent) => {
      setGameOver(null); setBuzzWinner(null); setLeaderboard([]); setActiveCellId(null);
    }, []),
    onLeaderboardUpdated: useCallback((e: LeaderboardUpdatedEvent) => setLeaderboard(e.entries), []),
    onReconnected: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.session(sessionId!) });
      refetch().then(result => {
        if (result.data?.status === 'Ended') { navigate('/'); return; }
        if (result.data?.cells) {
          const active = result.data.cells.find(c => c.state === 'Active');
          setActiveCellId(active?.id ?? null);
        }
        if (result.data?.buzzerLockedByPlayer) {
          setBuzzWinner({ playerName: result.data.buzzerLockedByPlayer, lockedAt: result.data.buzzerLockedAt ?? '' });
        } else {
          setBuzzWinner(null);
        }
      });
      if (playerName && sessionId) {
        const conn = getHubConnection(sessionId);
        conn.invoke('JoinAsPlayer', sessionId, playerName).catch(() => {});
      }
    }, [queryClient, sessionId, refetch, playerName, navigate]),
    onKicked:       useCallback(() => navigate('/'), [navigate]),
    onSessionEnded: useCallback(() => navigate('/'), [navigate]),
  });

  const buzzMutation = useMutation({
    mutationFn: () => buzz(sessionId!, playerName),
    onError: () => {
      setBuzzFailed(true);
      setTimeout(() => setBuzzFailed(false), 800);
    },
  });

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    sessionStorage.setItem('hurof_player', playerName.trim());
    setNameSubmitted(true);
  };

  const handleChangeName = () => {
    sessionStorage.removeItem('hurof_player');
    setNameSubmitted(false);
    if (sessionId) {
      const conn = getHubConnection(sessionId);
      conn.invoke('LeaveAsPlayer', sessionId).catch(() => {});
    }
  };

  const handleExit = () => {
    sessionStorage.removeItem('hurof_player');
    if (sessionId) {
      const conn = getHubConnection(sessionId);
      conn.invoke('LeaveAsPlayer', sessionId).catch(() => {});
    }
    navigate('/');
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--void)' }}>
        <Loader
          size={36}
          style={{ color: 'var(--gold)', animation: 'spin 1s linear infinite' }}
          aria-label="جارٍ التحميل"
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── No session ── */
  if (!session) {
    return (
      <RtlWrapper>
        <div className="min-h-dvh flex items-center justify-center p-4" style={{ background: 'var(--void)' }}>
          <div className="text-center flex flex-col items-center gap-4">
            <XCircle size={48} style={{ color: '#f87171' }} aria-hidden="true" />
            <p className="font-arabic" style={{ color: 'var(--cream-2)' }}>الجلسة غير موجودة</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl font-bold font-arabic transition-all hover:brightness-110"
              style={{ background: 'var(--elevated)', color: 'var(--cream)', border: '1px solid var(--border-gold)' }}
            >
              ← رجوع للرئيسية
            </button>
          </div>
        </div>
      </RtlWrapper>
    );
  }

  /* ── Name entry ── */
  if (!nameSubmitted) {
    return (
      <RtlWrapper>
        <div className="min-h-dvh flex items-start justify-center p-4 pt-[25dvh] pb-52" style={{ background: 'var(--void)' }}>
          <form
            onSubmit={handleNameSubmit}
            className="w-full max-w-xs flex flex-col gap-4"
            style={{ animation: 'float-in-scale 0.45s ease both' }}
          >
            <h2
              className="text-center font-bold"
              style={{ fontFamily: "'Amiri', serif", fontSize: '2.2rem', color: 'var(--gold-2)' }}
            >
              أدخل اسمك
            </h2>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="اسمك"
              className="w-full px-4 py-3 rounded-xl font-arabic text-center outline-none transition-all"
              style={{
                background: 'var(--surface)',
                color: 'var(--cream)',
                border: '1px solid rgba(201,168,76,0.22)',
                fontSize: '1.1rem',
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="w-full py-3 rounded-2xl font-black text-lg font-arabic transition-all disabled:opacity-40 hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, var(--gold-dim), var(--gold), var(--gold-2))',
                color: '#07090F',
                boxShadow: '0 4px 22px var(--gold-glow)',
              }}
            >
              انضم
            </button>
          </form>
        </div>
      </RtlWrapper>
    );
  }

  const hasActiveLetter = !!activeCellId;
  const isLocked = !!buzzWinner;
  const iWon     = buzzWinner?.playerName === playerName;
  const canBuzz  = !isLocked && hasActiveLetter && session.status !== 'Ended';

  /* ── Buzzer state config ── */
  type BuzzerState = 'canBuzz' | 'won' | 'lost' | 'waiting';
  const buzzerState: BuzzerState = isLocked ? (iWon ? 'won' : 'lost') : !hasActiveLetter ? 'waiting' : 'canBuzz';

  const isPending = buzzMutation.isPending;

  /* ── Cinematic ambient config per state ── */
  const ambientConfig = {
    canBuzz: {
      orbColor: 'rgba(201,168,76,0.18)',
      orbSize: 420,
      animation: 'gold-bloom-pulse 2s ease-in-out infinite',
    },
    won: {
      orbColor: 'rgba(74,222,128,0.22)',
      orbSize: 480,
      animation: 'gold-bloom-pulse 1.5s ease-in-out infinite',
    },
    lost: {
      orbColor: 'rgba(255,255,255,0.02)',
      orbSize: 300,
      animation: 'none',
    },
    waiting: {
      orbColor: 'rgba(255,255,255,0.02)',
      orbSize: 300,
      animation: 'none',
    },
  }[buzzerState];

  const buzzerConfig = {
    canBuzz: {
      bg:      'linear-gradient(145deg, #B8922A 0%, var(--gold) 35%, var(--gold-bright) 65%, var(--gold-2) 100%)',
      glow:    '0 0 0 1px rgba(255,255,255,0.15) inset, 0 -4px 0 rgba(0,0,0,0.4) inset, 0 4px 0 rgba(255,255,255,0.12) inset, 0 8px 50px rgba(201,168,76,0.55), 0 0 120px rgba(201,168,76,0.2)',
      color:   '#02020A',
      icon:    null,
      text:    'اضغط!',
      subtext: '',
      ring:    true,
    },
    won: {
      bg:      'linear-gradient(145deg, #14532d 0%, #16a34a 40%, #4ade80 80%, #86efac 100%)',
      glow:    '0 0 0 1px rgba(255,255,255,0.15) inset, 0 -4px 0 rgba(0,0,0,0.4) inset, 0 4px 0 rgba(255,255,255,0.15) inset, 0 8px 50px rgba(74,222,128,0.5), 0 0 120px rgba(74,222,128,0.2)',
      color:   '#fff',
      icon:    <Trophy size={32} aria-hidden="true" />,
      text:    'أنت أول!',
      subtext: '',
      ring:    false,
    },
    lost: {
      bg:      'linear-gradient(145deg, #0a0b0e, #13151c)',
      glow:    '0 0 0 1px rgba(255,255,255,0.05) inset, 0 4px 20px rgba(0,0,0,0.6)',
      color:   'var(--cream-2)',
      icon:    <Lock size={22} aria-hidden="true" style={{ opacity: 0.6 }} />,
      text:    'سبقك!',
      subtext: buzzWinner?.playerName ?? '',
      ring:    false,
    },
    waiting: {
      bg:      'linear-gradient(145deg, #0a0b0e, #13151c)',
      glow:    '0 0 0 1px rgba(255,255,255,0.04) inset, 0 4px 20px rgba(0,0,0,0.5)',
      color:   'rgba(255,255,255,0.2)',
      icon:    null,
      text:    'انتظر...',
      subtext: '',
      ring:    false,
    },
  }[buzzerState];

  return (
    <RtlWrapper>
      <div
        className="relative min-h-dvh flex flex-col items-center justify-center gap-7 overflow-hidden"
        style={{
          background: 'var(--void)',
          padding: 'calc(1.5rem + env(safe-area-inset-top, 0px)) calc(1.5rem + env(safe-area-inset-right, 0px)) calc(1.5rem + env(safe-area-inset-bottom, 0px)) calc(1.5rem + env(safe-area-inset-left, 0px))',
        }}
      >
        {/* Cinematic reactive ambient orb */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: ambientConfig.orbSize,
            height: ambientConfig.orbSize,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${ambientConfig.orbColor} 0%, transparent 70%)`,
            filter: 'blur(60px)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: ambientConfig.animation,
            transition: 'background 0.6s ease, width 0.6s ease, height 0.6s ease',
            pointerEvents: 'none',
          }}
        />

        {/* Player name */}
        <div className="relative flex flex-col items-center gap-1.5">
          <span
            className="text-xl font-bold font-arabic"
            style={{
              color: buzzerState === 'won' ? '#4ade80' : buzzerState === 'canBuzz' ? 'var(--gold-2)' : 'var(--cream)',
              transition: 'color 0.4s ease',
              textShadow: buzzerState === 'canBuzz' ? '0 0 20px rgba(201,168,76,0.5)' : buzzerState === 'won' ? '0 0 20px rgba(74,222,128,0.5)' : 'none',
            }}
          >
            {playerName}
          </span>
          <button
            onClick={handleChangeName}
            className="text-xs font-arabic transition-all hover:opacity-80"
            style={{ color: 'var(--cream-2)', opacity: 0.65 }}
          >
            تغيير الاسم
          </button>
        </div>

        {/* Buzzer button */}
        <div className="relative flex items-center justify-center">
          {/* Expanding rings — more dramatic */}
          {buzzerConfig.ring && (
            <>
              {[0, 0.55, 1.1, 1.65].map(delay => (
                <div
                  key={delay}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    width: 240,
                    height: 240,
                    borderRadius: '50%',
                    border: `${delay === 0 ? 2 : 1}px solid rgba(201,168,76,${delay === 0 ? 0.6 : 0.3})`,
                    animation: `ring-expand 2s ${delay}s cubic-bezier(0.25,0.46,0.45,0.94) infinite`,
                    pointerEvents: 'none',
                  }}
                />
              ))}
            </>
          )}

          {/* Outer halo ring */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: 270, height: 270,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${buzzerState === 'won' ? 'rgba(74,222,128,0.08)' : buzzerState === 'canBuzz' ? 'rgba(201,168,76,0.08)' : 'transparent'} 0%, transparent 70%)`,
              filter: 'blur(8px)',
              transition: 'background 0.5s ease',
              pointerEvents: 'none',
            }}
          />

          <button
            onClick={() => {
              if (!canBuzz || isPending) return;
              navigator.vibrate?.(15);
              buzzMutation.mutate();
            }}
            disabled={!canBuzz || isPending}
            aria-label={canBuzz ? 'اضغط الجرس' : buzzerConfig.text}
            className="relative w-60 h-60 rounded-full font-black font-arabic transition-all flex flex-col items-center justify-center gap-2.5 active:scale-[0.92]"
            style={{
              background: buzzerConfig.bg,
              color: buzzerConfig.color,
              boxShadow: buzzFailed
                ? '0 0 0 4px rgba(248,113,113,0.7), 0 8px 50px rgba(248,113,113,0.4)'
                : buzzerConfig.glow,
              fontSize: buzzerState === 'lost' ? '1.5rem' : '1.9rem',
              transition: buzzFailed ? 'box-shadow 0.1s ease' : 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
              border: 'none',
              opacity: isPending ? 0.7 : 1,
              transform: isPending ? 'scale(0.97)' : undefined,
            }}
          >
            {buzzerConfig.icon}
            <span style={{ lineHeight: 1 }}>{isPending ? 'جارٍ...' : buzzerConfig.text}</span>
            {buzzerConfig.subtext ? (
              <span style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1, fontWeight: 700 }}>
                {buzzerConfig.subtext}
              </span>
            ) : null}
          </button>
        </div>

        {buzzerState === 'waiting' && (
          <span
            className="text-sm font-arabic"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            انتظر اختيار الحرف
          </span>
        )}

        <ConnectionStatus state={connectionState} />

        <button
          onClick={handleExit}
          className="relative text-xs font-arabic transition-all hover:opacity-60"
          style={{ color: 'var(--cream-2)', opacity: 0.65 }}
        >
          الخروج من اللعبة
        </button>
      </div>

      {gameOver && leaderboard.length > 0 && (
        <GameEndLeaderboardOverlay entries={leaderboard} currentPlayerName={playerName} />
      )}
      {gameOver && leaderboard.length === 0 && (
        <GameOverBanner
          winnerTeam={gameOver.winnerTeam}
          team1Color={session.team1Color}
          team2Color={session.team2Color}
        />
      )}
    </RtlWrapper>
  );
}
