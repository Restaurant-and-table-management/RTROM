import { create } from 'zustand';
import { orderApi } from '../api/orderApi';
import useCartStore from './useCartStore';

const useOrderStore = create((set, get) => ({
  orders: [],
  allOrders: [], // For admin
  currentOrder: null,
  isLoading: false,
  error: null,

  fetchMyOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getMyOrders();
      set({ orders: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch orders', isLoading: false });
    }
  },

  fetchAllOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getAllOrders();
      set({ allOrders: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch all orders', isLoading: false });
    }
  },

  placeOrder: async (notes, tableNumber) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.placeOrder(notes, tableNumber);
      // After successfully placing an order, the cart on the backend is cleared.
      // We should tell the cart store to clear its state or re-fetch.
      useCartStore.getState().fetchCart();
      
      set({ isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to place order', isLoading: false });
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      await orderApi.updateOrderStatus(id, status);
      await get().fetchAllOrders(); // Refresh list
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update status', isLoading: false });
    }
  },

  cancelOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await orderApi.cancelOrder(id);
      await get().fetchMyOrders(); // Refresh list
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to cancel order', isLoading: false });
    }
  },
}));

export default useOrderStore;
