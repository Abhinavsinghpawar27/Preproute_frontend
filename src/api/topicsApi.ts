import { axiosInstance } from './axiosInstance';
import type { Topic, SubTopic } from '../types';

export interface TopicsResponse {
  success: boolean;
  data: Topic[];
}

export interface SubTopicsResponse {
  success: boolean;
  data: SubTopic[];
}

export const topicsApi = {
  getTopicsBySubject: async (subjectId: string): Promise<Topic[]> => {
    const response = await axiosInstance.get<TopicsResponse>(`/topics/subject/${subjectId}`);
    return response.data.data;
  },

  getSubTopicsByTopics: async (topicIds: string[]): Promise<SubTopic[]> => {
    const response = await axiosInstance.post<SubTopicsResponse>('/sub-topics/multi-topics', { topicIds });
    return response.data.data;
  },
};
