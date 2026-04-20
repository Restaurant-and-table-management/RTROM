import React, { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import useOrderStore from '../../store/useOrderStore';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/reservations', label: 'Reservations' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/orders', label: 'Orders' },
];

const STATUSES = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

function AdminOrdersPage() {
  const { allOrders, fetchAllOrders, updateOrderStatus, isLoading } = useOrderStore();
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const handleStatusChange = async (id, newStatus) => {
    await updateOrderStatus(id, newStatus);
  };

  const filteredOrders = filter === 'ALL' 
    ? allOrders 
    : allOrders.filter(o => o.status === filter);

  return (
    <DashboardShell title="Order Management" subtitle="Manage incoming kitchen orders." navItems={navItems}>
      <div className="mb-6 flex gap-2 flex-wrap">
        <button 
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'ALL' ? 'bg-[color:var(--primary)] text-white' : 'bg-white border text-[color:var(--text-secondary)]'}`}
        >All</button>
        {STATUSES.map(s => (
          <button 
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === s ? 'bg-[color:var(--primary)] text-white' : 'bg-white border text-[color:var(--text-secondary)]'}`}
          >{s}</button>
        ))}
      </div>

      {isLoading && allOrders.length === 0 ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[color:var(--accent)] border-t-transparent rounded-full"></div></div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[color:var(--border)] p-12 text-center">
          <p className="text-[color:var(--text-secondary)] text-lg">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[color:var(--border)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[color:var(--border)]">
                <th className="p-4 font-semibold text-sm text-[color:var(--text-secondary)]">Order ID</th>
                <th className="p-4 font-semibold text-sm text-[color:var(--text-secondary)]">User</th>
                <th className="p-4 font-semibold text-sm text-[color:var(--text-secondary)]">Items</th>
                <th className="p-4 font-semibold text-sm text-[color:var(--text-secondary)]">Total</th>
                <th className="p-4 font-semibold text-sm text-[color:var(--text-secondary)]">Status</th>
                <th className="p-4 font-semibold text-sm text-[color:var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium">#{order.id}</td>
                  <td className="p-4 text-sm">{order.username}</td>
                  <td className="p-4 text-sm">
                    {order.items.map(i => `${i.quantity}x ${i.menuItemName}`).join(', ')}
                  </td>
                  <td className="p-4 text-sm font-semibold">${order.totalAmount.toFixed(2)}</td>
                  <td className="p-4 text-sm">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{order.status}</span>
                  </td>
                  <td className="p-4 text-sm">
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="border border-[color:var(--border)] rounded px-2 py-1 text-sm bg-white"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}

export default AdminOrdersPage;
