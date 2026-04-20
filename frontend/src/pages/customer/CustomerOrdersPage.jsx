import React, { useEffect } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import useOrderStore from '../../store/useOrderStore';

const navItems = [
  { to: '/customer', label: 'Dashboard', end: true },
  { to: '/customer/menu', label: 'Menu' },
  { to: '/customer/cart', label: 'My Cart' },
  { to: '/customer/orders', label: 'My Orders' },
  { to: '/customer/reservations', label: 'Reservations' },
];

function CustomerOrdersPage() {
  const { orders, fetchMyOrders, cancelOrder, isLoading } = useOrderStore();

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      await cancelOrder(id);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING': return 'bg-blue-100 text-blue-800';
      case 'READY': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardShell title="My Orders" subtitle="Track your active orders and view your order history." navItems={navItems}>
      {isLoading && orders.length === 0 ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[color:var(--accent)] border-t-transparent rounded-full"></div></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[color:var(--border)] p-12 text-center">
          <p className="text-[color:var(--text-secondary)] text-lg">You have no orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-[color:var(--border)] overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-[color:var(--border)] flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-[color:var(--text-secondary)] mb-1">Order #{order.id}</p>
                  <p className="font-semibold text-[color:var(--text-primary)]">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  {order.status === 'PENDING' && (
                    <button 
                      onClick={() => handleCancel(order.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <ul className="divide-y divide-[color:var(--border)]">
                  {order.items.map(item => (
                    <li key={item.id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-[color:var(--primary)]">{item.quantity}x</span>
                        <span className="text-[color:var(--text-primary)]">{item.menuItemName}</span>
                      </div>
                      <span className="text-[color:var(--text-secondary)]">${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-[color:var(--border)] flex justify-between items-center">
                  <span className="font-semibold text-[color:var(--text-secondary)]">Total</span>
                  <span className="text-xl font-black text-[color:var(--primary)]">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

export default CustomerOrdersPage;
