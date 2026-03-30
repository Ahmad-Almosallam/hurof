import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RtlWrapper } from '../../components/layout/RtlWrapper';
import { GameOverBanner } from '../../components/ui/GameOverBanner';
import { ConnectionStatus } from '../../components/ui/ConnectionStatus';
import { useGameHub } from '../../hooks/useGameHub';
import { queryKeys } from '../../lib/queryKeys';
import { getSession } from '../../api/sessions';
import { buzz } from '../../api/buzzer';
import * as signalR from '@microsoft/signalr';
import { getHubConnection, stopHubConnection } from '../../lib/signalr';
import type { BuzzWinnerEvent, GameOverEvent, GameResetEvent } from '../../types/api';

export function PlayerBuzzerPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [playerName, setPlayerName]     = useState(() => sessionStorage.getItem('hurof_player') ?? '');
  const [nameSubmitted, setNameSubmitted] = useState(!!sessionStorage.getItem('hurof_player'));
  const [buzzWinner, setBuzzWinner]       = useState<BuzzWinnerEvent | null>(null);
  const [gameOver, setGameOver]           = useState<GameOverEvent | null>(null);
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
    return () => {
      if (sessionId) {
        const conn = getHubConnection(sessionId);
        if (conn.state === signalR.HubConnectionState.Connected) {
          stopHubConnection(sessionId).catch(() => {});
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    onBuzzWinner:  useCallback((e: BuzzWinnerEvent) => setBuzzWinner(e), []),
    onGameOver:    useCallback((e: GameOverEvent)  => setGameOver(e),   []),
    onBuzzerReset: useCallback(() => setBuzzWinner(null), []),
    onGameReset:   useCallback((_e: GameResetEvent) => {
      setGameOver(null); setBuzzWinner(null); setActiveCellId(null);
    }, []),
    onReconnected: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.session(sessionId!) });
      refetch().then(result => {
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
    }, [queryClient, sessionId, refetch, playerName]),
    onKicked:       useCallback(() => navigate('/'), [navigate]),
    onSessionEnded: useCallback(() => navigate('/'), [navigate]),
  });

  const buzzMutation = useMutation({
    mutationFn: () => buzz(sessionId!, playerName),
    onSuccess: (data) => {
      if (data.accepted) setBuzzWinner({ playerName, lockedAt: new Date().toISOString() });
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--void)' }}>
        <div className="font-arabic" style={{ color: 'var(--cream-2)' }}>جارٍ التحميل...</div>
      </div>
    );
  }

  /* ── No session ── */
  if (!session) {
    return (
      <RtlWrapper>
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--void)' }}>
          <div className="text-center flex flex-col gap-4">
            <div className="text-4xl mb-2">❌</div>
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
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--void)' }}>
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
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.55)')}
              onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.22)')}
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

  const buzzerConfig = {
    canBuzz: {
      bg:    'linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 45%, var(--gold-2) 100%)',
      glow:  '0 0 40px var(--gold-glow), 0 0 80px rgba(201,168,76,0.15)',
      color: '#07090F',
      text:  'اضغط!',
      ring:  true,
    },
    won: {
      bg:    'linear-gradient(135deg, #166534 0%, #22c55e 50%, #4ade80 100%)',
      glow:  '0 0 40px rgba(74,222,128,0.35), 0 0 80px rgba(74,222,128,0.15)',
      color: '#fff',
      text:  '🎉 أنت أول!',
      ring:  false,
    },
    lost: {
      bg:    'var(--surface)',
      glow:  'none',
      color: 'var(--cream-2)',
      text:  `🔒 ${buzzWinner?.playerName ?? ''}`,
      ring:  false,
    },
    waiting: {
      bg:    'var(--surface)',
      glow:  'none',
      color: 'var(--muted)',
      text:  '⏳ انتظر...',
      ring:  false,
    },
  }[buzzerState];

  return (
    <RtlWrapper>
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-10"
        style={{
          background: 'var(--void)',
          padding: 'calc(1.5rem + env(safe-area-inset-top, 0px)) calc(1.5rem + env(safe-area-inset-right, 0px)) calc(1.5rem + env(safe-area-inset-bottom, 0px)) calc(1.5rem + env(safe-area-inset-left, 0px))',
        }}
      >
        {/* Player name */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold font-arabic" style={{ color: 'var(--cream)' }}>
            {playerName}
          </span>
          <button
            onClick={handleChangeName}
            className="text-sm font-arabic underline transition-all hover:brightness-125"
            style={{ color: 'var(--cream-2)' }}
          >
            تغيير الاسم
          </button>
        </div>

        {/* Buzzer button */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Expanding rings when active */}
          {buzzerConfig.ring && (
            <>
              {[0, 0.6, 1.2].map(delay => (
                <div
                  key={delay}
                  style={{
                    position: 'absolute',
                    width: 224,
                    height: 224,
                    borderRadius: '50%',
                    border: '2px solid var(--gold)',
                    animation: `ring-expand 1.8s ${delay}s ease-out infinite`,
                    pointerEvents: 'none',
                  }}
                />
              ))}
            </>
          )}

          <button
            onClick={() => canBuzz && buzzMutation.mutate()}
            disabled={!canBuzz}
            className="w-56 h-56 rounded-full font-black text-3xl font-arabic transition-all"
            style={{
              background: buzzerConfig.bg,
              color: buzzerConfig.color,
              boxShadow: buzzerConfig.glow,
              border: `2px solid ${buzzerState === 'canBuzz' ? 'rgba(201,168,76,0.5)' : 'transparent'}`,
              cursor: canBuzz ? 'pointer' : 'default',
            }}
            onMouseDown={e => { if (canBuzz) (e.currentTarget.style.transform = 'scale(0.95)'); }}
            onMouseUp={e   => { (e.currentTarget.style.transform = 'scale(1)'); }}
            onMouseLeave={e => { (e.currentTarget.style.transform = 'scale(1)'); }}
          >
            {buzzerConfig.text}
          </button>
        </div>

        <ConnectionStatus state={connectionState} />

        <button
          onClick={handleExit}
          className="text-sm font-arabic underline transition-all hover:brightness-125"
          style={{ color: 'var(--muted)' }}
        >
          الخروج من اللعبة
        </button>
      </div>

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
