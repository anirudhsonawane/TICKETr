'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/Spinner';
import { Phone, CreditCard, Smartphone } from 'lucide-react';
import { configurePhonePeSentry, configurePhonePeWindowHandling } from '@/lib/phonepe';

interface PhonePePaymentProps {
  amount: number;
  eventId: string;
  userId: string;
  quantity: number;
  passId?: string;
  couponCode?: string;
  selectedDate?: string;
  waitingListId?: string;
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

export default function PhonePePayment({
  amount,
  eventId,
  userId,
  quantity,
  passId,
  couponCode,
  selectedDate,
  waitingListId,
  onSuccess,
  onError,
}: PhonePePaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentInterface, setPaymentInterface] = useState<any>(null);
  const [showPaymentInterface, setShowPaymentInterface] = useState(false);

  // Configure PhonePe error handling on component mount
  useEffect(() => {
    configurePhonePeSentry();
    configurePhonePeWindowHandling();
  }, []);

  const handlePhonePePayment = async () => {
    if (!amount || amount <= 0 || !eventId || !userId) {
      const errorMsg = 'Payment amount must be greater than 0';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Initiating PhonePe payment...', {
        amount,
        eventId,
        userId,
        quantity,
        passId,
        couponCode,
        selectedDate,
        waitingListId,
        timestamp: new Date().toISOString()
      });

      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/create-phonepe-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount), // Ensure amount is sent as number
          eventId,
          userId,
          quantity,
          passId,
          couponCode,
          selectedDate,
          waitingListId,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
          throw new Error(`Payment initiation failed with status ${response.status}`);
        }
        
        const errorMsg = errorData?.details || errorData?.error || 'Payment initiation failed';
        console.error('PhonePe payment error:', {
          errorData,
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('PhonePe payment initiated:', data);

      if (!data.success) {
        throw new Error('Invalid response from payment service');
      }

      // Create payment session in database
      try {
        const sessionResponse = await fetch('/api/payment-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: data.merchantOrderId,
            userId,
            eventId,
            amount,
            quantity,
            passId,
            selectedDate,
            couponCode,
            waitingListId,
            paymentMethod: 'phonepe',
            metadata: {
              orderId: data.orderId,
              redirectUrl: data.redirectUrl,
              state: data.state,
              expireAt: data.expireAt
            }
          }),
        });

        if (!sessionResponse.ok) {
          console.warn('Failed to create payment session:', await sessionResponse.text());
        } else {
          console.log('Payment session created successfully');
        }
      } catch (sessionError) {
        console.warn('Error creating payment session:', sessionError);
        // Continue with payment even if session creation fails
      }

      // Check if we have a payment interface (mock mode) or redirect URL (real mode)
      if (data.paymentInterface) {
        // Show payment interface (mock mode)
        setPaymentInterface(data.paymentInterface);
        setShowPaymentInterface(true);
      } else if (data.redirectUrl) {
        // Redirect to PhonePe payment page (real mode)
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('No payment method available');
      }

    } catch (error) {
      console.error('PhonePe payment error:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        timestamp: new Date().toISOString()
      });
      
      let errorMsg = 'Payment failed';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMsg = 'Payment request timed out. Please try again.';
        } else if (error.message.includes('timeout')) {
          errorMsg = 'Payment request timed out. Please try again.';
        } else if (error.message.includes('network')) {
          errorMsg = 'Network error. Please check your connection and try again.';
        } else {
          errorMsg = error.message;
        }
      }
      
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockPaymentComplete = () => {
    // Simulate payment completion
    setShowPaymentInterface(false);
    onSuccess?.(paymentInterface?.orderId || 'mock_order');
  };

  const handleMockPaymentCancel = () => {
    setShowPaymentInterface(false);
    setPaymentInterface(null);
    // Redirect to payment result page with cancelled status
    window.location.href = `https://www.ticketr.yoloclub.in/payment-result?orderId=${paymentInterface?.orderId}&status=CANCELLED`;
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-blue-100 rounded-full">
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold">PhonePe Payment</CardTitle>
          <CardDescription>
            Pay securely with PhonePe - India's most trusted payment app
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              ₹{amount.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {quantity} ticket{quantity > 1 ? 's' : ''}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handlePhonePePayment}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Spinner size="sm" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Pay with PhonePe</span>
                </div>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                You will be redirected to PhonePe for secure payment
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <CreditCard className="h-4 w-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Smartphone className="h-4 w-4" />
                <span>Mobile</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>UPI</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Interface Modal */}
      {showPaymentInterface && paymentInterface && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl font-semibold">PhonePe Payment</CardTitle>
              <CardDescription>
                Complete your payment using PhonePe
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Order Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Order ID:</span>
                  <span className="text-sm font-mono">{paymentInterface.orderId}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-lg font-bold text-green-600">₹{paymentInterface.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Merchant:</span>
                  <span className="text-sm">{paymentInterface.merchantName}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                  <img 
                    src={paymentInterface.qrCode} 
                    alt="PhonePe QR Code" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">Scan with PhonePe app</p>
              </div>

              {/* UPI ID */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Or enter UPI ID manually:</p>
                  <div className="bg-white p-3 rounded border">
                    <code className="text-lg font-mono text-blue-600">{paymentInterface.upiId}</code>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Payment Instructions:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {paymentInterface.instructions.map((instruction: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">{instruction.split(' ')[0]}</span>
                      <span>{instruction.substring(instruction.indexOf(' ') + 1)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleMockPaymentComplete}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Complete Payment
                </Button>
                <Button
                  onClick={handleMockPaymentCancel}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  This is a mock payment interface for development
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
