import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { paymentService } from '../services/payment';
import { Loader2 } from 'lucide-react';

export function PaymentCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId] = useState<number | null>(() => {
    const id = searchParams.get('orderId');
    return id ? parseInt(id, 10) : null;
  });

  useEffect(() => {
    const handleCheckout = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!orderId) {
          setError('Order ID is required');
          setLoading(false);
          return;
        }

        // Create payment + get Stripe checkout URL in one call (will redirect)
        await paymentService.createAndPay(orderId);
      } catch (err) {
        console.error('Checkout error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initiate checkout');
        setLoading(false);
      }
    };

    if (orderId) {
      handleCheckout();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Processing Payment</CardTitle>
            <CardDescription>Redirecting to checkout...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Checkout Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/customer')} variant="outline" className="flex-1">
                Back to Orders
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null; // Page should redirect to Stripe
}
