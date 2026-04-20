import { create } from 'zustand';
import { cartApi } from '../api/cartApi';

const useCartStore = create((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.getCart();
      set({ cart: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch cart', isLoading: false });
    }
  },

  addItem: async (menuItemId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.addItem(menuItemId, quantity);
      await get().fetchCart();
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to add item', isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.updateQuantity(cartItemId, quantity);
      await get().fetchCart();
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update quantity', isLoading: false });
    }
  },

  removeItem: async (cartItemId) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.removeItem(cartItemId);
      await get().fetchCart();
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to remove item', isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.clearCart();
      set({ cart: null, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to clear cart', isLoading: false });
    }
  },
}));

export default useCartStore;
