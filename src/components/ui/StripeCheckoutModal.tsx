'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ─── Inner form — renders ONLY the payment fields, no buttons ─────────────
interface CheckoutFormProps {
  order: Order;
  onSuccess: (paymentIntentId: string) => void;
  onError: (msg: string) => void;
  onSubmittingChange: (v: boolean) => void;
}

function CheckoutForm({ order, onSuccess, onError, onSubmittingChange }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    onSubmittingChange(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message ?? 'Payment failed. Please try again.');
      } else if (paymentIntent) {
        onSuccess(paymentIntent.id);
      }
    } finally {
      onSubmittingChange(false);
    }
  };

  return (
    <form id="stripe-checkout-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Order summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Amount due</p>
        <p className="text-3xl font-bold text-green-700">{formatCurrency(order.totalAmount)}</p>
        <p className="text-xs text-gray-500 mt-1">Order #{order.orderNumber}</p>
      </div>

      {/* Stripe card / wallet form */}
      <PaymentElement />
    </form>
  );
}

// ─── Modal shell ───────────────────────────────────────────────────────────
interface StripeCheckoutModalProps {
  order: Order | null;
  onSuccess: (paymentIntentId: string) => void;
  onClose: () => void;
}

export default function StripeCheckoutModal({ order, onSuccess, onClose }: StripeCheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!order) return;
    setClientSecret(null);
    setLoadError(null);
    setPayError(null);
    setSubmitting(false);

    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: order.totalAmount,
        orderId: order.id,
        orderNumber: order.orderNumber,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setClientSecret(data.clientSecret);
      })
      .catch(err => setLoadError(err.message ?? 'Failed to initialise payment.'));
  }, [order]);

  const handleSuccess = (paymentIntentId: string) => {
    onSuccess(paymentIntentId);
    onClose();
  };

  if (!order) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card: flex column with capped height so body scrolls */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">

        {/* ── Sticky header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Secure Payment</h2>
              <p className="text-xs text-gray-500">Powered by Stripe</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 min-h-0 px-6 py-5">
          {loadError && (
            <div className="text-center py-8">
              <p className="text-red-600 text-sm">{loadError}</p>
            </div>
          )}

          {!loadError && !clientSecret && (
            <div className="flex flex-col items-center py-10 gap-3">
              <svg className="w-8 h-8 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm text-gray-500">Initialising payment…</p>
            </div>
          )}

          {clientSecret && (
            <>
              {payError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {payError}
                </div>
              )}
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance: { theme: 'stripe' } }}
              >
                <CheckoutForm
                  order={order}
                  onSuccess={handleSuccess}
                  onError={setPayError}
                  onSubmittingChange={setSubmitting}
                />
              </Elements>
            </>
          )}
        </div>

        {/* ── Sticky footer — always visible ── */}
        {(clientSecret || loadError) && (
          <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            {clientSecret && (
              <button
                type="submit"
                form="stripe-checkout-form"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay {formatCurrency(order.totalAmount)}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


