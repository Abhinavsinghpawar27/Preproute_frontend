import { axiosInstance } from './axiosInstance';
import type { Question } from '../types';

export interface BulkCreateQuestionsPayload {
  questions: Omit<Question, 'id'>[];
}

// Real API shape: { status: "success"/"error", message?: string, data: Question[] }
export interface ApiQuestionsResponse {
  status: string;
  message?: string;
  data: Question[];
}

export const questionsApi = {
  bulkCreate: async (payload: BulkCreateQuestionsPayload): Promise<ApiQuestionsResponse> => {
    const response = await axiosInstance.post<ApiQuestionsResponse>('/questions/bulk', payload);
    return response.data;
  },

  fetchBulk: async (questionIds: string[]): Promise<Question[]> => {
    const response = await axiosInstance.post<ApiQuestionsResponse>('/questions/fetchBulk', {
      question_ids: questionIds,
    });
    return response.data.data;
  },
};
