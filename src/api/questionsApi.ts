import { axiosInstance } from './axiosInstance';
import type { Question } from '../types';

export interface BulkCreateQuestionsPayload {
  questions: Omit<Question, 'id'>[];
}

export interface BulkCreateQuestionsResponse {
  success: boolean;
  data: Question[];
  message?: string;
}

export interface FetchBulkQuestionsResponse {
  success: boolean;
  data: Question[];
}

export const questionsApi = {
  bulkCreate: async (payload: BulkCreateQuestionsPayload): Promise<BulkCreateQuestionsResponse> => {
    const response = await axiosInstance.post<BulkCreateQuestionsResponse>('/questions/bulk', payload);
    return response.data;
  },

  fetchBulk: async (questionIds: string[]): Promise<Question[]> => {
    const response = await axiosInstance.post<FetchBulkQuestionsResponse>('/questions/fetchBulk', {
      question_ids: questionIds,
    });
    return response.data.data;
  },
};
