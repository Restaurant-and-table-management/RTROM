import { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import ToastMessage from '../../components/ui/ToastMessage';
import StatusBadge from '../../components/ui/StatusBadge';
import { getAllReviews, approveReview, deleteReview } from '../../api/reviewApi';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/reservations', label: 'Reservations' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/reviews', label: 'Reviews' },
];

function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: 'error', message: '' });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      setReviews(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load reviews.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveReview(id);
      setToast({ type: 'success', message: 'Review approved and published!' });
      await loadReviews();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to approve review.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReview(id);
      setToast({ type: 'success', message: 'Review deleted.' });
      await loadReviews();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to delete review.' });
    }
  };

  return (
    <DashboardShell
      title="Review Management"
      subtitle="Moderate customer feedback before it is published to other customers."
      navItems={navItems}
    >
      <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />

      <div className="bg-white rounded-2xl border border-[color:var(--border)] overflow-hidden shadow-[var(--shadow-sm)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[color:var(--surface-alt)] border-b border-[color:var(--border)]">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Reviewer</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Rating</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Comment</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border)]">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4">
                  <p className="font-semibold text-[color:var(--text-primary)]">{review.reviewerName}</p>
                  <p className="text-[10px] text-[color:var(--text-muted)]">{new Date(review.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4 text-amber-400 font-bold">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <p className="text-sm text-[color:var(--text-secondary)] line-clamp-2" title={review.comment}>
                    {review.comment}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={review.approved ? 'APPROVED' : 'PENDING'} />
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {!review.approved && (
                    <button onClick={() => handleApprove(review.id)} className="btn-accent px-3 py-1 text-[10px] uppercase">
                      Approve
                    </button>
                  )}
                  <button onClick={() => handleDelete(review.id)} className="btn-ghost px-3 py-1 text-[10px] uppercase text-rose-500">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-[color:var(--text-muted)] font-medium italic">
                  No reviews submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

export default AdminReviewsPage;
