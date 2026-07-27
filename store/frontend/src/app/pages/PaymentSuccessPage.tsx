import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { paymentService, PaymentStatus } from '../services/payment';
import { CheckCircle } from 'lucide-react';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const paymentId = paymentService.getPaymentIdFromUrl();
        if (!paymentId) {
          throw new Error('Payment ID not found');
        }

        const status = await paymentService.getPaymentStatus(paymentId);
        setPaymentStatus(status);
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
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle>Payment Successful</CardTitle>
          <CardDescription>Your order has been paid successfully</CardDescription>
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
                <span className="font-medium text-green-600">{paymentStatus.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Message:</span>
                <span className="font-medium">{paymentStatus.message}</span>
              </div>
            </div>
          )}

          <Alert>
            <AlertDescription>
              A confirmation email has been sent to your registered email address.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/customer')} className="w-full">
              View Orders
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
