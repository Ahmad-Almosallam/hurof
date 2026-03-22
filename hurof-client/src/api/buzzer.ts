import { api } from '../lib/api';
import type { BuzzResponse } from '../types/api';

export const buzz = (sessionId: string, playerName: string): Promise<BuzzResponse> =>
  api.post(`/api/sessions/${sessionId}/buzzer/buzz`, { playerName }).then(r => r.data);

export const resetBuzzer = (sessionId: string): Promise<void> =>
  api.post(`/api/sessions/${sessionId}/buzzer/reset`);
