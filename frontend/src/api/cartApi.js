import client from './client';

export const cartApi = {
  getCart: () => client.get('/cart'),
  addItem: (menuItemId, quantity) => client.post('/cart/items', { menuItemId, quantity }),
  updateQuantity: (cartItemId, quantity) => client.put(`/cart/items/${cartItemId}`, { quantity }),
  removeItem: (cartItemId) => client.delete(`/cart/items/${cartItemId}`),
  clearCart: () => client.delete('/cart'),
};
