import apiClient from './client';

/**
 * Fetch approved reviews (public — no auth required).
 */
export const getPublicReviews = async () => {
  const response = await apiClient.get('/reviews/public');
  return response.data;
};

/**
 * Submit a new review (Requires authentication).
 */
export const submitReview = async (reviewData) => {
  const response = await apiClient.post('/reviews', reviewData);
  return response.data;
};

/**
 * Fetch all reviews (Requires ADMIN role).
 */
export const getAllReviews = async () => {
  const response = await apiClient.get('/reviews');
  return response.data;
};

/**
 * Approve a review (Requires ADMIN role).
 */
export const approveReview = async (id) => {
  const response = await apiClient.put(`/reviews/${id}/approve`);
  return response.data;
};

/**
 * Delete a review (Requires ADMIN role).
 */
export const deleteReview = async (id) => {
  const response = await apiClient.delete(`/reviews/${id}`);
  return response.data;
};
