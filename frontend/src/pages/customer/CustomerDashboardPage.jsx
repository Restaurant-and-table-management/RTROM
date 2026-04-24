import { useState, useEffect } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import ToastMessage from '../../components/ui/ToastMessage';
import { submitReview, getPublicReviews } from '../../api/reviewApi';
import { getMyReservations } from '../../api/reservationApi';
import { getMyOrders } from '../../api/orderApi';
import useAuthStore from '../../store/useAuthStore';

const navItems = [
  { to: '/customer', label: 'Dashboard', end: true },
  { to: '/customer/reserve', label: 'Reserve' },
  { to: '/customer/menu', label: 'Menu' },
  { to: '/customer/reservations', label: 'Reservations' },
  { to: '/customer/profile', label: 'Profile' },
];

function CustomerDashboardPage() {
  const { user } = useAuthStore();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: 'error', message: '' });
  const [upcomingReservation, setUpcomingReservation] = useState(null);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [publicReviews, setPublicReviews] = useState([]);

  // Bulletproof way to get the user's name
  const getReviewerName = () => {
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split('@')[0];
    const token = useAuthStore.getState().token;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sub) return payload.sub.split('@')[0];
      } catch (e) {
        // ignore parsing errors
      }
    }
    return 'Customer';
  };

  useEffect(() => {
    async function loadStats() {
      try {
        const reservations = await getMyReservations().catch(() => []);
        const now = new Date();
        const upcoming = reservations
          .filter(r => new Date(`${r.reservationDate}T${r.startTime}`) > now)
          .sort((a, b) => new Date(`${a.reservationDate}T${a.startTime}`) - new Date(`${b.reservationDate}T${b.startTime}`));

        if (upcoming.length > 0) {
          setUpcomingReservation(upcoming[0]);
        }
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoadingUpcoming(false);
      }
    }
    
    async function loadReviews() {
      try {
        const data = await getPublicReviews();
        setPublicReviews(data || []);
      } catch (error) {
        console.error('Failed to load community reviews', error);
      }
    }

    loadStats();
    loadReviews();
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitReview({
        reviewerName: getReviewerName(),
        restaurantName: 'LuxeServe',
        rating,
        comment
      });
      setToast({ type: 'success', message: 'Thank you for your feedback!' });
      setShowFeedbackModal(false);
      setRating(5);
      setComment('');
    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: 'Failed to submit feedback. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (  
    <DashboardShell
      title="Customer Dashboard"
      subtitle="Track your upcoming reservations & manage your dining experiences."
      navItems={navItems}
    >
      {/* Upcoming Reservation Enhanced Display */}
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] md:p-8">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-[color:var(--text-primary)]">Upcoming Reservation</h3>
        </div>

        {loadingUpcoming ? (
          <p className="text-[color:var(--text-secondary)]">Loading your schedule...</p>
        ) : upcomingReservation ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-xl border border-emerald-100 bg-emerald-50/50 p-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Confirmed Booking</p>
              <div className="flex items-end gap-3 pt-2">
                <span className="text-3xl font-bold text-[color:var(--primary)]">
                  {new Date(upcomingReservation.reservationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                </span>
                <span className="text-lg font-medium text-[color:var(--text-secondary)] mb-1">
                  at {new Date(`1970-01-01T${upcomingReservation.startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs font-semibold text-[color:var(--text-muted)] uppercase">Table</p>
                <p className="text-lg font-bold text-[color:var(--text-primary)]">{upcomingReservation.tableNumber}</p>
              </div>
              <div className="h-10 w-px bg-emerald-200"></div>
              <div className="text-center">
                <p className="text-xs font-semibold text-[color:var(--text-muted)] uppercase">Guests</p>
                <p className="text-lg font-bold text-[color:var(--text-primary)]">{upcomingReservation.guestCount}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[color:var(--border)] p-6 text-center">
            <p className="text-[color:var(--text-secondary)]">You don't have any upcoming reservations.</p>
          </div>
        )}
      </section>
      <section className="mt-6 rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">We value your experience</h3>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
            Let us know how your recent dining experience was so we can continue to improve.
          </p>
        </div>
        <button onClick={() => setShowFeedbackModal(true)} className="btn-primary whitespace-nowrap">
          Leave Feedback
        </button>
      </section>

      {/* Community Feedback Section */}
      {publicReviews.length > 0 && (
        <section className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-alt)] p-6 md:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[color:var(--text-primary)]">What Others Are Saying</h3>
            <p className="text-sm text-[color:var(--text-secondary)] mt-1">Read feedback from our community of diners.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publicReviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-[color:var(--border)] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="mb-2 text-amber-400 text-sm">
                  {'★'.repeat(review.rating || 5)}{'☆'.repeat(5 - (review.rating || 5))}
                </p>
                <p className="text-sm text-[color:var(--text-secondary)] italic line-clamp-3">"{review.comment}"</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 uppercase">
                    {(review.reviewerName && review.reviewerName !== 'Anonymous') ? review.reviewerName.charAt(0) : getReviewerName().charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[color:var(--text-primary)] capitalize">
                      {(!review.reviewerName || review.reviewerName === 'Anonymous') ? getReviewerName() : review.reviewerName}
                    </p>
                    <p className="text-[10px] text-[color:var(--text-muted)]">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-heading text-[color:var(--primary)] mb-1">Give Feedback</h3>
            <p className="text-sm text-[color:var(--text-secondary)] mb-6">How was your experience with LuxeServe?</p>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="label">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className={`text-4xl transition-all transform hover:scale-110 ${
                        (hoverRating || rating) >= star ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="label">Comments</label>
                <textarea
                  className="input min-h-[100px]"
                  placeholder="Tell us what you loved or what we can do better..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center disabled:opacity-50">
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
                <button type="button" onClick={() => setShowFeedbackModal(false)} className="btn-ghost flex-1 justify-center">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />
    </DashboardShell>
  );
}

export default CustomerDashboardPage;
