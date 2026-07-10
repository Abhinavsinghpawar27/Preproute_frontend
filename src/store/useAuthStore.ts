import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const getInitialState = () => {
  try {
    const token = localStorage.getItem('preproute_token');
    const userJson = localStorage.getItem('preproute_user');
    const user = userJson ? JSON.parse(userJson) : null;
    return {
      token,
      user,
      isAuthenticated: !!token,
    };
  } catch (error) {
    console.error('Failed to load auth state from localStorage:', error);
    return {
      token: null,
      user: null,
      isAuthenticated: false,
    };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  login: (token: string, user: User) => {
    localStorage.setItem('preproute_token', token);
    localStorage.setItem('preproute_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('preproute_token');
    localStorage.removeItem('preproute_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
