import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { getHubConnection } from '../lib/signalr';
import type { BuzzWinnerEvent, GameOverEvent, GameResetEvent, LetterCellResponse } from '../types/api';

export type ConnectionState = 'Connected' | 'Reconnecting' | 'Disconnected';

interface GameHubCallbacks {
  onGridUpdate?: (cell: LetterCellResponse) => void;
  onBuzzWinner?: (event: BuzzWinnerEvent) => void;
  onGameOver?: (event: GameOverEvent) => void;
  onBuzzerReset?: () => void;
  onGameReset?: (event: GameResetEvent) => void;
  onPlayerListUpdate?: (players: string[]) => void;
  onReconnected?: () => void;
}

export function useGameHub(sessionId: string, callbacks: GameHubCallbacks): { connectionState: ConnectionState } {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');

  useEffect(() => {
    if (!sessionId) return;

    const conn = getHubConnection(sessionId);

    const startAndJoin = async () => {
      if (conn.state === signalR.HubConnectionState.Disconnected) {
        await conn.start();
      }
      await conn.invoke('JoinSession', sessionId);
      setConnectionState('Connected');
    };

    conn.on('GridUpdate', (cell: LetterCellResponse) => callbacksRef.current.onGridUpdate?.(cell));
    conn.on('BuzzWinner', (e: BuzzWinnerEvent) => callbacksRef.current.onBuzzWinner?.(e));
    conn.on('GameOver', (e: GameOverEvent) => callbacksRef.current.onGameOver?.(e));
    conn.on('BuzzerReset', () => callbacksRef.current.onBuzzerReset?.());
    conn.on('GameReset', (e: GameResetEvent) => callbacksRef.current.onGameReset?.(e));
    conn.on('PlayerListUpdate', (players: string[]) => callbacksRef.current.onPlayerListUpdate?.(players));

    conn.onreconnecting(() => setConnectionState('Reconnecting'));
    conn.onreconnected(() => {
      setConnectionState('Connected');
      callbacksRef.current.onReconnected?.();
    });
    conn.onclose(() => setConnectionState('Disconnected'));

    startAndJoin();

    return () => {
      conn.off('GridUpdate');
      conn.off('BuzzWinner');
      conn.off('GameOver');
      conn.off('BuzzerReset');
      conn.off('GameReset');
      conn.off('PlayerListUpdate');
    };
  }, [sessionId]);

  return { connectionState };
}
