import { api } from '../lib/api';

export interface LoginResponse {
  token: string;
  expiresAt: string;
}

export const login = (password: string): Promise<LoginResponse> =>
  api.post('/api/auth/login', { password }).then(r => r.data);
