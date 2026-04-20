import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import useCartStore from '../../store/useCartStore';
import useOrderStore from '../../store/useOrderStore';

const navItems = [
  { to: '/customer', label: 'Dashboard', end: true },
  { to: '/customer/menu', label: 'Menu' },
  { to: '/customer/cart', label: 'My Cart' },
  { to: '/customer/orders', label: 'My Orders' },
  { to: '/customer/reservations', label: 'Reservations' },
];

function CustomerCartPage() {
  const { cart, fetchCart, updateQuantity, removeItem, clearCart, isLoading: isCartLoading } = useCartStore();
  const { placeOrder, isLoading: isOrderLoading } = useOrderStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) return;
    try {
      // In a real app, tableNumber might come from the user's active reservation or input
      await placeOrder("Placed from web", null);
      navigate('/customer/orders');
    } catch (error) {
      alert("Failed to place order: " + error.message);
    }
  };

  if (isCartLoading && !cart) {
    return (
      <DashboardShell title="My Cart" navItems={navItems}>
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[color:var(--accent)] border-t-transparent rounded-full"></div></div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="My Cart" subtitle="Review your items before placing an order." navItems={navItems}>
      {(!cart || cart.items.length === 0) ? (
        <div className="bg-white rounded-xl shadow-sm border border-[color:var(--border)] p-12 text-center">
          <p className="text-[color:var(--text-secondary)] text-lg">Your cart is empty.</p>
          <button onClick={() => navigate('/customer/menu')} className="mt-4 btn-primary">Browse Menu</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-[color:var(--border)] overflow-hidden">
              <div className="p-6 border-b border-[color:var(--border)] flex justify-between items-center">
                <h3 className="font-semibold text-lg">Cart Items</h3>
                <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">Clear Cart</button>
              </div>
              <ul className="divide-y divide-[color:var(--border)]">
                {cart.items.map((item) => (
                  <li key={item.id} className="p-6 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[color:var(--text-primary)]">{item.menuItemName}</h4>
                      <p className="text-[color:var(--text-secondary)] text-sm">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-[color:var(--border)] flex items-center justify-center hover:bg-gray-50 text-[color:var(--text-primary)] font-bold"
                      >-</button>
                      <span className="w-4 text-center font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-[color:var(--border)] flex items-center justify-center hover:bg-gray-50 text-[color:var(--text-primary)] font-bold"
                      >+</button>
                    </div>
                    <div className="text-right w-20">
                      <p className="font-bold">${item.subTotal.toFixed(2)}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-[color:var(--border)] p-6 sticky top-8">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm border-b border-[color:var(--border)] pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-[color:var(--text-secondary)]">Items ({cart.items.length})</span>
                  <span className="font-medium">${cart.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--text-secondary)]">Taxes & Fees</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>
              <div className="flex justify-between items-end mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-black text-2xl text-[color:var(--primary)]">${cart.totalPrice.toFixed(2)}</span>
              </div>
              <button 
                onClick={handlePlaceOrder} 
                disabled={isOrderLoading}
                className="w-full btn-accent justify-center py-3 text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOrderLoading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

export default CustomerCartPage;
