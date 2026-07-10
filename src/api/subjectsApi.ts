import { axiosInstance } from './axiosInstance';
import type { Subject } from '../types';

export interface SubjectsResponse {
  success: boolean;
  data: Subject[];
}

export const subjectsApi = {
  getSubjects: async (): Promise<Subject[]> => {
    const response = await axiosInstance.get<SubjectsResponse>('/subjects');
    return response.data.data;
  },
};
