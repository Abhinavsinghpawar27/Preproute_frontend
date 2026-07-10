import { axiosInstance } from './axiosInstance';
import type { Test } from '../types';

export interface TestsListResponse {
  success: boolean;
  data: Test[];
}

export interface SingleTestResponse {
  success: boolean;
  data: Test;
}

export interface CreateUpdateTestResponse {
  success: boolean;
  data: Test;
  message?: string;
}

export const testsApi = {
  getTests: async (): Promise<Test[]> => {
    const response = await axiosInstance.get<TestsListResponse>('/tests');
    return response.data.data;
  },

  getTestById: async (id: string): Promise<Test> => {
    const response = await axiosInstance.get<SingleTestResponse>(`/tests/${id}`);
    return response.data.data;
  },

  createTest: async (payload: Partial<Test>): Promise<CreateUpdateTestResponse> => {
    const response = await axiosInstance.post<CreateUpdateTestResponse>('/tests', payload);
    return response.data;
  },

  updateTest: async (id: string, payload: Partial<Test>): Promise<CreateUpdateTestResponse> => {
    const response = await axiosInstance.put<CreateUpdateTestResponse>(`/tests/${id}`, payload);
    return response.data;
  },

  publishTest: async (id: string): Promise<CreateUpdateTestResponse> => {
    const response = await axiosInstance.put<CreateUpdateTestResponse>(`/tests/${id}`, { status: 'live' });
    return response.data;
  },
};
