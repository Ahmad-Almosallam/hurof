import * as signalR from '@microsoft/signalr';

const connections = new Map<string, signalR.HubConnection>();

export function getHubConnection(sessionId: string): signalR.HubConnection {
  if (connections.has(sessionId)) return connections.get(sessionId)!;

  const conn = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_BASE ?? 'http://localhost:5000'}/hubs/game`)
    .withAutomaticReconnect()
    .build();

  connections.set(sessionId, conn);
  return conn;
}

export async function stopHubConnection(sessionId: string) {
  const conn = connections.get(sessionId);
  if (conn) {
    await conn.stop();
    connections.delete(sessionId);
  }
}

/** Manually retry a connection that has fully disconnected (automatic reconnect exhausted). */
export async function retryConnection(sessionId: string): Promise<void> {
  const conn = connections.get(sessionId);
  if (!conn || conn.state !== signalR.HubConnectionState.Disconnected) return;
  await conn.start();
}
