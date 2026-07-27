import { fetchWithAuth } from './auth';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082').replace(/\/$/, '');

export interface PaymentResponse {
  checkoutUrl: string;
  paymentId: number;
  sessionId: string;
}

export interface PaymentStatus {
  paymentId: number;
  status: string;
  message: string;
}

export const paymentService = {
  /**
   * Create payment AND initiate Stripe checkout in one call
   */
  async createAndPay(orderId: number): Promise<PaymentResponse> {
    const resp = await fetchWithAuth(`${API_URL}/api/payments`, {
      method: 'POST',
      body: JSON.stringify({ orderId, initiateCheckout: true }),
    });
    if (!resp.ok) throw new Error('Failed to create payment');
    const data = await resp.json();
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    }
    return data;
  },

  /**
   * Get payment ID from URL parameters
   */
  getPaymentIdFromUrl(): number | null {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('paymentId');
    return paymentId ? parseInt(paymentId, 10) : null;
  },

  /**
   * Check if payment was successful
   */
  isPaymentSuccessful(): boolean {
    return window.location.pathname.includes('/payment/success');
  },

  /**
   * Check if payment failed
   */
  isPaymentFailed(): boolean {
    return window.location.pathname.includes('/payment/failure');
  },
};
