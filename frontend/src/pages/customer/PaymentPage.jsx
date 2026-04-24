import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '../../api/paymentService';
import toast from 'react-hot-toast';

const normalizeStripePublishableKey = (value) => {
  if (!value) return '';

  const trimmed = value.trim();
  const commentIndex = trimmed.indexOf('#');
  return commentIndex >= 0 ? trimmed.slice(0, commentIndex).trim() : trimmed;
};

const isValidStripePublishableKey = (value) => {
  if (!value || value.includes('...')) return false;

  const lowercase = value.toLowerCase();
  if (lowercase.includes('replace with actual')) return false;

  return value.startsWith('pk_test_') || value.startsWith('pk_live_');
};

const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  fallback;

const stripePublishableKey = normalizeStripePublishableKey(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const stripePromise = isValidStripePublishableKey(stripePublishableKey)
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(null);

const CheckoutForm = ({ clientSecret, paymentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (error) {
      toast.error(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await paymentService.verifyPayment(paymentId, paymentIntent.id);
        toast.success("Payment successful!");
        navigate('/customer/menu'); // Or to a success page
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to verify payment with server."));
      } finally {
        setIsProcessing(false);
      }
    } else {
      setIsProcessing(false);
      toast.error("Payment failed. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#ffffff',
              '::placeholder': {
                color: 'rgba(255, 255, 255, 0.4)',
              },
            },
            invalid: {
              color: '#fb7185',
            },
          },
        }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3 rounded-xl 
bg-gradient-to-r from-indigo-500 to-indigo-600
text-white font-semibold
shadow-lg hover:shadow-xl
hover:scale-[1.02] active:scale-[0.98]
disabled:opacity-50 disabled:cursor-not-allowed
transition-all duration-200"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const { billId } = useParams();
  const [clientSecret, setClientSecret] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    initiatePayment();
  }, [billId]);

  const initiatePayment = async () => {
    if (!isValidStripePublishableKey(stripePublishableKey)) {
      const message = 'Stripe publishable key is missing or still a placeholder. Set a real VITE_STRIPE_PUBLISHABLE_KEY in frontend/.env.';
      setErrorMessage(message);
      toast.error(message);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await paymentService.createOrder(billId);
      setClientSecret(res.clientSecret);
      setPaymentId(res.paymentId);
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to initiate payment');
      setErrorMessage(message);
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading payment gateway...</div>;

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center text-red-500">
        {errorMessage || 'Error loading payment.'}
      </div>
    );
  }

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

      {/* Glassmorphic Payment Card */}
      <div className="relative z-10 w-full max-w-md backdrop-blur-2xl bg-black/40 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden text-white p-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30 mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">Secure Payment</h2>
          <p className="text-indigo-200/60 text-sm mt-1 uppercase tracking-widest font-bold">Transaction Encrypted</p>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm clientSecret={clientSecret} paymentId={paymentId} />
        </Elements>

        <div className="mt-8 flex items-center justify-center gap-4 text-white/20">
          <svg className="h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M1 4h22v16H1z"/></svg>
          <svg className="h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M1 4h22v16H1z"/></svg>
          <svg className="h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M1 4h22v16H1z"/></svg>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
