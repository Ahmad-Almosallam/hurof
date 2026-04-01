import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { getHubConnection } from '../lib/signalr';
import type { BuzzWinnerEvent, GameOverEvent, GameResetEvent, LeaderboardUpdatedEvent, LetterCellResponse, TimerStartedEvent } from '../types/api';

export type ConnectionState = 'Connected' | 'Reconnecting' | 'Disconnected';

interface GameHubCallbacks {
  onGridUpdate?: (cell: LetterCellResponse) => void;
  onBuzzWinner?: (event: BuzzWinnerEvent) => void;
  onGameOver?: (event: GameOverEvent) => void;
  onBuzzerReset?: () => void;
  onGameReset?: (event: GameResetEvent) => void;
  onPlayerListUpdate?: (players: string[]) => void;
  onTimerStarted?: (event: TimerStartedEvent) => void;
  onLeaderboardUpdated?: (event: LeaderboardUpdatedEvent) => void;
  onConnected?: () => void;
  onReconnected?: () => void;
  onKicked?: () => void;
  onSessionEnded?: () => void;
}

/**
 * Tracks which HubConnection instances have already had their lifecycle
 * handlers (onreconnecting / onreconnected / onclose) registered.
 * SignalR's lifecycle API is additive with no removal mechanism, so we
 * register exactly once per connection object.
 */
const lifecycleRegistered = new WeakSet<signalR.HubConnection>();

export function useGameHub(sessionId: string, callbacks: GameHubCallbacks): { connectionState: ConnectionState } {
  // Always-current callbacks — avoids stale closures without adding deps
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');

  // Stable ref to the setter so lifecycle handlers registered once can
  // always call the current component's setState even after re-renders.
  const setStateRef = useRef(setConnectionState);
  setStateRef.current = setConnectionState;

  useEffect(() => {
    if (!sessionId) return;

    // Cancelled flag guards the async startAndJoin from completing after
    // React Strict Mode cleanup or an early unmount.
    let cancelled = false;

    const conn = getHubConnection(sessionId);

    // ── Named message handlers so conn.off(event, fn) removes only ours ──
    const onGridUpdate      = (cell: LetterCellResponse)  => callbacksRef.current.onGridUpdate?.(cell);
    const onBuzzWinner      = (e: BuzzWinnerEvent)        => callbacksRef.current.onBuzzWinner?.(e);
    const onGameOver        = (e: GameOverEvent)          => callbacksRef.current.onGameOver?.(e);
    const onBuzzerReset     = ()                          => callbacksRef.current.onBuzzerReset?.();
    const onGameReset       = (e: GameResetEvent)         => callbacksRef.current.onGameReset?.(e);
    const onPlayerListUpdate = (players: string[])        => callbacksRef.current.onPlayerListUpdate?.(players);
    const onTimerStarted    = (e: TimerStartedEvent)      => callbacksRef.current.onTimerStarted?.(e);
    const onLeaderboardUpdated = (e: LeaderboardUpdatedEvent) => callbacksRef.current.onLeaderboardUpdated?.(e);
    const onYouWereKicked   = ()                          => callbacksRef.current.onKicked?.();
    const onSessionEnded    = ()                          => callbacksRef.current.onSessionEnded?.();

    conn.on('GridUpdate',       onGridUpdate);
    conn.on('BuzzWinner',       onBuzzWinner);
    conn.on('GameOver',         onGameOver);
    conn.on('BuzzerReset',      onBuzzerReset);
    conn.on('GameReset',        onGameReset);
    conn.on('PlayerListUpdate', onPlayerListUpdate);
    conn.on('TimerStarted',        onTimerStarted);
    conn.on('LeaderboardUpdated',  onLeaderboardUpdated);
    conn.on('YouWereKicked',       onYouWereKicked);
    conn.on('SessionEnded',        onSessionEnded);

    // ── Lifecycle handlers — registered at most once per connection ──
    // SignalR's onreconnecting/onreconnected/onclose APIs only add callbacks;
    // there is no removal API. We prevent accumulation with lifecycleRegistered.
    if (!lifecycleRegistered.has(conn)) {
      lifecycleRegistered.add(conn);

      conn.onreconnecting(() => {
        setStateRef.current('Reconnecting');
      });

      conn.onreconnected(async () => {
        try {
          await conn.invoke('JoinSession', sessionId);
        } catch {
          // Connection may have closed again before we could rejoin
        }
        setStateRef.current('Connected');
        callbacksRef.current.onReconnected?.();
      });

      conn.onclose(() => {
        setStateRef.current('Disconnected');
      });
    }

    // ── Start + join ──
    const startAndJoin = async () => {
      try {
        if (conn.state === signalR.HubConnectionState.Disconnected) {
          await conn.start();
        }
        // Wait out the brief Connecting phase (React Strict Mode double-invoke)
        let waited = 0;
        while (conn.state === signalR.HubConnectionState.Connecting && waited < 2000) {
          await new Promise<void>(r => setTimeout(r, 50));
          waited += 50;
        }
        if (cancelled) return;
        if (conn.state !== signalR.HubConnectionState.Connected) return;
        await conn.invoke('JoinSession', sessionId);
        if (cancelled) return;
        setStateRef.current('Connected');
        callbacksRef.current.onConnected?.();
      } catch {
        // Connection attempt failed; onclose will fire and set Disconnected
      }
    };

    startAndJoin();

    return () => {
      cancelled = true;
      conn.off('GridUpdate',       onGridUpdate);
      conn.off('BuzzWinner',       onBuzzWinner);
      conn.off('GameOver',         onGameOver);
      conn.off('BuzzerReset',      onBuzzerReset);
      conn.off('GameReset',        onGameReset);
      conn.off('PlayerListUpdate', onPlayerListUpdate);
      conn.off('TimerStarted',        onTimerStarted);
      conn.off('LeaderboardUpdated',  onLeaderboardUpdated);
      conn.off('YouWereKicked',       onYouWereKicked);
      conn.off('SessionEnded',        onSessionEnded);
    };
  }, [sessionId]);

  return { connectionState };
}
