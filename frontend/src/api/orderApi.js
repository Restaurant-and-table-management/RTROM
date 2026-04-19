import apiClient from './client';

export async function createOrder(payload) {
  const response = await apiClient.post('/orders', payload);
  return response.data;
}

export async function getOrders() {
  const response = await apiClient.get('/orders');
  return response.data;
}
