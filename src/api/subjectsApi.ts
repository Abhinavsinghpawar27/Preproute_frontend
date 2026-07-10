import { axiosInstance } from './axiosInstance';
import type { Subject } from '../types';

// Real API shape: { status: "success"/"error", data: Subject[] }
export interface ApiSubjectsResponse {
  status: string;
  data: Subject[];
}

export const subjectsApi = {
  getSubjects: async (): Promise<Subject[]> => {
    const response = await axiosInstance.get<ApiSubjectsResponse>('/subjects');
    return response.data.data;
  },
};
