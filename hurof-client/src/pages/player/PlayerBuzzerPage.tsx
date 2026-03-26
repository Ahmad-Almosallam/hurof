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
  const [playerName, setPlayerName] = useState(() => sessionStorage.getItem('hurof_player') ?? '');
  const [nameSubmitted, setNameSubmitted] = useState(!!sessionStorage.getItem('hurof_player'));
  const [buzzWinner, setBuzzWinner] = useState<BuzzWinnerEvent | null>(null);
  const [gameOver, setGameOver] = useState<GameOverEvent | null>(null);
  const [activeCellId, setActiveCellId] = useState<string | null>(null);

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

  // Stop the connection on unmount (only when actually Connected, to avoid killing it mid-negotiation in React Strict Mode)
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

  // After name is submitted, invoke JoinAsPlayer so the host can see us
  useEffect(() => {
    if (!nameSubmitted || !sessionId || !playerName) return;
    const conn = getHubConnection(sessionId);
    if (conn.state === 'Connected') {
      conn.invoke('JoinAsPlayer', sessionId, playerName).catch(() => {});
    }
  }, [nameSubmitted, sessionId, playerName]);

  const { connectionState } = useGameHub(sessionId ?? '', {
    onGridUpdate: useCallback((cell: { id: string; state: string }) => {
      if (cell.state === 'Active') setActiveCellId(cell.id);
      else setActiveCellId(prev => prev === cell.id ? null : prev);
    }, []),
    onBuzzWinner: useCallback((e: BuzzWinnerEvent) => setBuzzWinner(e), []),
    onGameOver: useCallback((e: GameOverEvent) => setGameOver(e), []),
    onBuzzerReset: useCallback(() => setBuzzWinner(null), []),
    onGameReset: useCallback((_e: GameResetEvent) => {
      setGameOver(null);
      setBuzzWinner(null);
      setActiveCellId(null);
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
      // Re-register as player after reconnect
      if (playerName && sessionId) {
        const conn = getHubConnection(sessionId);
        conn.invoke('JoinAsPlayer', sessionId, playerName).catch(() => {});
      }
    }, [queryClient, sessionId, refetch, playerName]),
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">جارٍ التحميل...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <RtlWrapper>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="text-center flex flex-col gap-4">
            <div className="text-4xl mb-2">❌</div>
            <p className="text-slate-400">الجلسة غير موجودة</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors"
            >
              ← رجوع للرئيسية
            </button>
          </div>
        </div>
      </RtlWrapper>
    );
  }

  if (!nameSubmitted) {
    return (
      <RtlWrapper>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <form onSubmit={handleNameSubmit} className="w-full max-w-xs flex flex-col gap-4">
            <h2 className="text-2xl font-black text-amber-400 text-center">أدخل اسمك</h2>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="اسمك"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:border-amber-400 focus:outline-none text-center"
              autoFocus
            />
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-lg disabled:opacity-40"
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
  const iWon = buzzWinner?.playerName === playerName;

  return (
    <RtlWrapper>
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-8 p-4">
        <div className="flex items-center gap-3">
          <span className="text-slate-300 text-lg font-bold">{playerName}</span>
          <button
            onClick={handleChangeName}
            className="text-slate-500 hover:text-slate-300 text-sm underline transition-colors"
          >
            تغيير الاسم
          </button>
        </div>

        <button
          onClick={() => buzzMutation.mutate()}
          disabled={isLocked || !hasActiveLetter || session.status === 'Ended'}
          className={`w-56 h-56 rounded-full font-black text-3xl transition-all active:scale-95 shadow-2xl
            ${isLocked
              ? iWon
                ? 'bg-green-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : !hasActiveLetter
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-900 cursor-pointer'
            }`}
        >
          {isLocked
            ? iWon ? '🎉 أنت أول!' : `🔒 ${buzzWinner!.playerName}`
            : !hasActiveLetter ? '⏳ انتظر...' : '🔔 اضغط!'}
        </button>

        <ConnectionStatus state={connectionState} />

        <button
          onClick={handleExit}
          className="text-slate-600 hover:text-slate-400 text-sm underline transition-colors"
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
