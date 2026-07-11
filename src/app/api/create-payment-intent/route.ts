import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any, // Cast to any to bypass strict version checks if necessary, or use the correct latest string
});

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId, orderNumber, currency = 'usd' } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Stripe amounts are in the smallest currency unit (cents for USD)
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: {
        orderId: String(orderId),
        orderNumber: orderNumber ?? '',
        platform: 'AgriLink Lanka',
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Stripe PaymentIntent error:', error);
    return NextResponse.json(
      { error: error.message ?? 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
