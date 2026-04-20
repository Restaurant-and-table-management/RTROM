import client from './client';

export const orderApi = {
  placeOrder: (notes, tableNumber) => client.post('/orders', { notes, tableNumber }),
  getMyOrders: () => client.get('/orders/my-orders'),
  getOrderById: (id) => client.get(`/orders/${id}`),
  cancelOrder: (id) => client.put(`/orders/${id}/cancel`),
  
  // Admin endpoints
  getAllOrders: () => client.get('/orders'),
  updateOrderStatus: (id, status) => client.put(`/orders/${id}/status`, { status }),
};
