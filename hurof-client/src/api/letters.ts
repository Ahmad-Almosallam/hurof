import { api } from '../lib/api';
import type { LetterState, QuestionResponse, SetLetterStateResponse } from '../types/api';

export const setCellState = (sessionId: string, cellId: string, state: LetterState): Promise<SetLetterStateResponse> =>
  api.patch(`/api/sessions/${sessionId}/letters/${cellId}/state`, { state }).then(r => r.data);

export const getQuestion = (sessionId: string, cellId: string): Promise<QuestionResponse> =>
  api.get(`/api/sessions/${sessionId}/letters/${cellId}/question`).then(r => r.data);

export const nextQuestion = (sessionId: string, cellId: string): Promise<QuestionResponse> =>
  api.post(`/api/sessions/${sessionId}/letters/${cellId}/next-question`).then(r => r.data);
