import axios from 'axios';
import type { LoginRequest, LoginResponse } from '../interfaces/IAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const MOCK_USER: LoginResponse = {
  token: 'mock-jwt-token-12345',
  user: {
    id: '1',
    name: 'Admin TechStore',
    email: 'admin@techstore.com',
    role: 'admin',
  },
};

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  if (
    credentials.email === 'admin@techstore.com' &&
    credentials.password === 'Admin1234'
  ) {
    return Promise.resolve(MOCK_USER);
  }

  try {
    const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { message?: string } } };
    throw new Error(axiosError.response?.data?.message || 'אימייל או סיסמה שגויים');
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getSession = (): LoginResponse['user'] | null => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginResponse['user'];
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

export const saveSession = (data: LoginResponse): void => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
};
