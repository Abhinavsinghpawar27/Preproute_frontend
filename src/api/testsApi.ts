import { axiosInstance } from './axiosInstance';
import type { Test } from '../types';

// Real API shape: { status: "success"/"error", message?: string, data: Test | Test[] }
export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export const testsApi = {
  getTests: async (): Promise<Test[]> => {
    const response = await axiosInstance.get<ApiResponse<Test[]>>('/tests');
    return response.data.data;
  },

  getTestById: async (id: string): Promise<Test> => {
    const response = await axiosInstance.get<ApiResponse<Test>>(`/tests/${id}`);
    return response.data.data;
  },

  createTest: async (payload: Partial<Test>): Promise<ApiResponse<Test>> => {
    const response = await axiosInstance.post<ApiResponse<Test>>('/tests', payload);
    return response.data;
  },

  updateTest: async (id: string, payload: Partial<Test>): Promise<ApiResponse<Test>> => {
    const response = await axiosInstance.put<ApiResponse<Test>>(`/tests/${id}`, payload);
    return response.data;
  },

  publishTest: async (id: string): Promise<ApiResponse<Test>> => {
    const response = await axiosInstance.put<ApiResponse<Test>>(`/tests/${id}`, { status: 'live' });
    return response.data;
  },
};
