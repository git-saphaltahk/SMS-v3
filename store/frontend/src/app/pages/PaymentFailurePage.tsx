import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { paymentService, PaymentStatus } from '../services/payment';
import { AlertTriangle } from 'lucide-react';

export function PaymentFailurePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const reason = searchParams.get('reason') || 'Payment was cancelled or failed';

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const paymentId = paymentService.getPaymentIdFromUrl();
        if (paymentId) {
          const status = await paymentService.getPaymentStatus(paymentId);
          setPaymentStatus(status);
        }
      } catch (error) {
        console.error('Error fetching payment status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle>Payment Failed</CardTitle>
          <CardDescription>Your payment could not be processed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loading && paymentStatus && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID:</span>
                <span className="font-medium">{paymentStatus.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-red-600">{paymentStatus.status}</span>
              </div>
            </div>
          )}

          <Alert variant="destructive">
            <AlertDescription>
              {reason}
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription>
              Please check your payment details and try again. If the problem persists, please contact support.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/customer')} className="w-full">
              Back to Orders
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
