import { axiosInstance } from './axiosInstance';
import type { User } from '../types';

export interface LoginRequest {
  userId: string;
  password: string;
}

// Real API shape: { status: "success", message: "...", data: { token, user } }
export interface LoginResponse {
  status: string;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
};
