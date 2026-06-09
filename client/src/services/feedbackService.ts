import { apiClient } from './apiClient';
import type { Feedback, FeedbackRequest, ApiResponse } from '@architect/shared';

export const submitFeedback = async (data: FeedbackRequest): Promise<ApiResponse<Feedback>> => {
  const res = await apiClient.post<ApiResponse<Feedback>>('/feedback', data);
  return res.data;
};
