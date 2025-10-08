'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: true 
      });
      
      // If redirect is true, the function will redirect and never reach here
      // This code only runs if redirect fails or is set to false
      if (result?.error) {
        console.error('Google sign in error:', result.error);
        if (result.error === 'Configuration') {
          toast.error('Google OAuth is not configured properly. Please check your .env.local file and restart the dev server.');
        } else if (result.error === 'AccessDenied') {
          toast.error('Access denied. Please try again.');
        } else {
          toast.error(`Sign in failed: ${result.error}. Check the console for details.`);
        }
        setLoading(false);
      } else if (result?.ok) {
        toast.success('Signed in successfully!');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('An error occurred. Please check your environment configuration and restart the dev server.');
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`OTP sent to ${phoneNumber}`);
        // In development, show the OTP for testing
        if (data.otp) {
          toast.success(`Development OTP: ${data.otp}`, { duration: 10000 });
        }
        setShowOtp(true);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Phone sign in error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('phone', {
        phoneNumber,
        otp,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid OTP. Please try again.');
      } else if (result?.ok) {
        toast.success('Phone number verified successfully!');
        router.push('/');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Logo size="md" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Back Button */}
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
          </div>

          {/* Welcome Message */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Sign In Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-center text-xl">Sign In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="w-full border-2 hover:border-orange-500 hover:text-orange-600 transition-all duration-300"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-5 h-5 mr-2" />
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              {/* Phone Sign In */}
              {!showOtp ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-11 h-11 border-2 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handlePhoneSignIn}
                    disabled={loading}
                    className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:brightness-110 text-white transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5 mr-2" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest h-14 border-2 focus:border-orange-500"
                    />
                    <p className="text-sm text-gray-600 text-center">
                      OTP sent to <span className="font-medium text-gray-900">{phoneNumber}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={handleOtpVerification}
                      disabled={loading}
                      className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:brightness-110 text-white transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify OTP'
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowOtp(false);
                        setOtp('');
                      }}
                      className="w-full hover:text-orange-600"
                    >
                      Change Phone Number
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer Text */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-orange-600 hover:text-orange-700 font-medium">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-orange-600 hover:text-orange-700 font-medium">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
