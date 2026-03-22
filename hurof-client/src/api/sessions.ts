import { api } from '../lib/api';
import type { SessionResponse } from '../types/api';

export interface CreateSessionRequest {
  gridSize: number;
  team1Color: string;
  team2Color: string;
}

export const getSession = (id: string): Promise<SessionResponse> =>
  api.get(`/api/sessions/${id}`).then(r => r.data);

export const createSession = (body: CreateSessionRequest): Promise<SessionResponse> =>
  api.post('/api/sessions', body).then(r => r.data);

export const deleteSession = (id: string): Promise<void> =>
  api.delete(`/api/sessions/${id}`);
