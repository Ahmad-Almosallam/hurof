import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { getHubConnection } from '../lib/signalr';
import type { BuzzWinnerEvent, GameOverEvent, LetterCellResponse } from '../types/api';

interface GameHubCallbacks {
  onGridUpdate?: (cell: LetterCellResponse) => void;
  onBuzzWinner?: (event: BuzzWinnerEvent) => void;
  onGameOver?: (event: GameOverEvent) => void;
  onBuzzerReset?: () => void;
}

export function useGameHub(sessionId: string, callbacks: GameHubCallbacks) {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!sessionId) return;

    const conn = getHubConnection(sessionId);

    const startAndJoin = async () => {
      if (conn.state === signalR.HubConnectionState.Disconnected) {
        await conn.start();
      }
      await conn.invoke('JoinSession', sessionId);
    };

    conn.on('GridUpdate', (cell: LetterCellResponse) => callbacksRef.current.onGridUpdate?.(cell));
    conn.on('BuzzWinner', (e: BuzzWinnerEvent) => callbacksRef.current.onBuzzWinner?.(e));
    conn.on('GameOver', (e: GameOverEvent) => callbacksRef.current.onGameOver?.(e));
    conn.on('BuzzerReset', () => callbacksRef.current.onBuzzerReset?.());

    startAndJoin();

    return () => {
      conn.off('GridUpdate');
      conn.off('BuzzWinner');
      conn.off('GameOver');
      conn.off('BuzzerReset');
    };
  }, [sessionId]);
}
