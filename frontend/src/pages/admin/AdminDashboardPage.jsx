import { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import { getReservationsByDate } from '../../api/reservationApi';
import { getTables } from '../../api/tableApi';
import useKitchenSocket from '../../hooks/useKitchenSocket';
import { getAllReviews, approveReview } from '../../api/reviewApi';
import StatusBadge from '../../components/ui/StatusBadge';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/reservations', label: 'Reservations' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/reviews', label: 'Reviews' },
];

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalTables: 0,
    availableTables: 0,
    occupiedTables: 0,
    todaysReservations: 0,
  });
  const [pendingReviews, setPendingReviews] = useState([]);
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const loadDashboard = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [tables, reservations] = await Promise.all([
        getTables(),
        getReservationsByDate(today),
      ]);

      setStats({
        totalTables: tables.length,
        availableTables: tables.filter((table) => table.status === 'AVAILABLE').length,
        occupiedTables: tables.filter((table) => table.status === 'OCCUPIED').length,
        todaysReservations: reservations.length,
      });
    } catch (error) {
      console.error('Dashboard reload failed', error);
    }
  };

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const all = await getAllReviews();
      setPendingReviews(all.filter(r => !r.approved));
      setApprovedReviews(all.filter(r => r.approved).slice(0, 5)); // Show latest 5 approved
    } catch (error) {
      console.error('Failed to load reviews', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadReviews();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveReview(id);
      const all = await getAllReviews(); // Refresh both lists
      setPendingReviews(all.filter(r => !r.approved));
      setApprovedReviews(all.filter(r => r.approved).slice(0, 5));
    } catch (error) {
      console.error('Failed to approve', error);
    }
  };

  useKitchenSocket(() => {
    console.log('[Admin Dashboard] Syncing stats...');
    loadDashboard();
  });

  const cards = [
    { label: 'Total Tables', value: stats.totalTables },
    { label: 'Available Tables', value: stats.availableTables },
    { label: 'Occupied Tables', value: stats.occupiedTables },
    { label: "Today's Reservations", value: stats.todaysReservations },
  ];

  return (
    <DashboardShell
      title="Admin Overview"
      subtitle="Monitor live restaurant capacity, manage tables, and oversee daily operations."
      navItems={navItems}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <p className="text-sm text-[color:var(--text-secondary)]">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-[color:var(--primary)]">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">Availability Snapshot</h3>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Use this as the reception desk pulse for how much floor capacity is currently sellable.</p>
          <div className="mt-4 h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-[color:var(--accent)]"
              style={{ width: `${stats.totalTables ? (stats.availableTables / stats.totalTables) * 100 : 0}%` }}
            />
          </div>
        </article>
        <article className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">Reservation Pulse</h3>
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--text-secondary)]">
            <li className="flex items-center justify-between"><span>Tables Ready to Sell</span><span className="font-semibold text-[color:var(--success)]">{stats.availableTables}</span></li>
            <li className="flex items-center justify-between"><span>Tables Occupied</span><span className="font-semibold text-[color:var(--error)]">{stats.occupiedTables}</span></li>
            <li className="flex items-center justify-between"><span>Reservations Today</span><span className="font-semibold">{stats.todaysReservations}</span></li>
          </ul>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-[color:var(--border)] bg-white overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="border-b border-[color:var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-[color:var(--text-primary)]">Pending Feedback</h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
            {pendingReviews.length} Action Required
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[color:var(--surface-alt)] border-b border-[color:var(--border)]">
              <tr>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Customer</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Feedback</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {pendingReviews.length > 0 ? (
                pendingReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm text-[color:var(--text-primary)]">{review.reviewerName}</p>
                      <div className="flex text-amber-400 text-[10px]">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[color:var(--text-secondary)] italic line-clamp-1" title={review.comment}>
                        "{review.comment}"
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleApprove(review.id)}
                        className="btn-accent px-3 py-1 text-[10px] uppercase font-bold"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-sm text-[color:var(--text-muted)] italic">
                    All clear! No pending reviews to moderate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-[color:var(--border)] bg-white overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="border-b border-[color:var(--border)] px-6 py-4">
          <h2 className="font-semibold text-[color:var(--text-primary)]">Publicly Visible Feedback</h2>
          <p className="text-xs text-[color:var(--text-secondary)] mt-1">These reviews are currently live for other customers to see.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[color:var(--surface-alt)] border-b border-[color:var(--border)]">
              <tr>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Customer</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Feedback</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {approvedReviews.length > 0 ? (
                approvedReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm text-[color:var(--text-primary)]">{review.reviewerName}</p>
                      <div className="flex text-amber-400 text-[10px]">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[color:var(--text-secondary)] italic line-clamp-1">
                        "{review.comment}"
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Live
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-sm text-[color:var(--text-muted)] italic">
                    No approved reviews yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}

export default AdminDashboardPage;
