import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { billService } from '../../api/billService';
import toast from 'react-hot-toast';

const MIN_ONLINE_PAYMENT_INR = 50;

const CheckoutPage = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBill();
  }, [billId]);

  const fetchBill = async () => {
    try {
      setLoading(true);
      const data = await billService.getBillById(billId);
      setBill(data);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to fetch bill details';
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const proceedToPayment = () => {
    navigate(`/customer/payment/${bill.id}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading bill...</div>;
  }

  if (!bill) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Bill not found.</div>;
  }

  const isBelowOnlinePaymentMinimum = Number(bill.grandTotal ?? 0) < MIN_ONLINE_PAYMENT_INR;

  return (
    <div className="min-h-screen relative flex items-center justify-center p-8 overflow-hidden font-sans">
      {/* Background Image with Cinematic Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 scale-105"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')`,
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Glassmorphic Checkout Card */}
      <div className="relative z-10 w-full max-w-2xl backdrop-blur-xl bg-black/40 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden text-white animate-in fade-in zoom-in duration-500">
        <div className="border-b border-white/10 p-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-white">
            Checkout Summary
          </h2>
          <div className="mt-2 inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-200 uppercase tracking-widest">
            Bill #{bill.billNumber}
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between py-1">
            <span className="text-indigo-100/60 font-medium">Subtotal</span>
            <span className="text-xl font-light">Rs {bill.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-indigo-100/60 font-medium">Tax (5%)</span>
            <span className="text-xl font-light text-indigo-200/80">Rs {bill.tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-1 text-red-300/80">
            <span className="font-medium">Discount</span>
            <span className="text-xl font-light">- Rs {bill.discount.toFixed(2)}</span>
          </div>
          
          <div className="mt-4 pt-6 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-indigo-300/60 font-bold mb-1">Total Amount Due</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">
                Rs {bill.grandTotal.toFixed(2)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {isBelowOnlinePaymentMinimum && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-sm text-amber-200 flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>Online card payments require a bill total of at least Rs 50.00 because of Stripe&apos;s minimum charge requirement.</p>
            </div>
          )}
        </div>

        <div className="bg-white/5 p-8 flex items-center justify-between border-t border-white/10">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-bold text-white/40 hover:text-white transition-all duration-200 uppercase tracking-widest"
          >
            Go Back
          </button>
          <button
            onClick={proceedToPayment}
            disabled={isBelowOnlinePaymentMinimum}
            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-gray-700 disabled:to-gray-800 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center gap-2"
          >
            <span>Confirm & Pay Now</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
