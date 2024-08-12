import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@api';
import { initializeWebSocket, closeWebSocket } from '@lib/websocket';
import { logger } from '@/lib/logger';

import { Button } from '@ui/button';
import { Card } from '@ui/card';
import { FiAlertCircle, FiCheckCircle, FiMail } from 'react-icons/fi';

export function VerifyEmail() {
  const [email, setEmail] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      // If no email is provided, redirect to signup
      navigate('/signup');
    }

    // Set up WebSocket connection
    const socket = initializeWebSocket();

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'email_verified') {
        setIsVerified(true);
      }
    };

    return () => {
      closeWebSocket();
    };
  }, [location, navigate]);

  const handleResendEmail = async () => {
    if (!email) return;
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);
    try {
      const response = await api.auth.resendVerificationEmail(email);
      if (response.success) {
        setResendSuccess(true);
      } else {
        setResendError(response.error || 'Failed to resend verification email');
      }
    } catch (error) {
      logger.error('Failed to resend verification email:', error);
      setResendError('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleUpdateEmail = () => {
    navigate('/signup');
  };

  if (isVerified) {
    return (
      <div className='flex dotted-background items-center justify-center min-h-screen min-w-[400px] px-4 py-12 relative'>
        <div className='absolute inset-0 lg:hidden'>
          <img src='https://picsum.photos/1080/1920' alt='Background Image' className='w-full h-full object-cover opacity-20' />
        </div>
        <Card className='flex items-center max-w-md rounded-lg shadow-lg overflow-hidden z-10'>
          <div className='flex flex-col justify-center mx-auto w-full max-w-md p-8'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4'>
                <FiCheckCircle className='w-8 h-8 text-primary' />
              </div>
              <h4 className='text-2xl font-semibold text-card-foreground'>Email Verified Successfully</h4>
              <p className='font-light mt-2 text-muted-foreground'>Your email has been verified. You can now log in to your account.</p>
              <Button onClick={() => navigate('/login')} className='w-full mt-4 font-bold bg-primary'>
                Continue to Login
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!email) {
    return null; // or a loading spinner
  }

  return (
    <div className='flex dotted-background items-center justify-center min-h-screen min-w-[400px] px-4 py-12 relative'>
      <div className='absolute inset-0 lg:hidden'>
        <img src='https://picsum.photos/1080/1920' alt='Background Image' className='w-full h-full object-cover opacity-20' />
      </div>
      <Card className='flex items-center max-w-md rounded-lg shadow-lg overflow-hidden z-10'>
        <div className='flex flex-col justify-center mx-auto w-full max-w-md p-8'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4'>
              <FiMail className='w-8 h-8 text-primary' />
            </div>
            <h4 className='text-2xl font-semibold text-card-foreground'>Please verify your email</h4>
            <p className='font-light mt-2 text-muted-foreground'>
              We just sent an email to {email}.<br />
              Click the link in the email to verify your account.
            </p>
            <div className='mt-6 space-y-2'>
              <Button onClick={handleResendEmail} className='w-full font-bold bg-primary' disabled={isResending}>
                {isResending ? 'Sending...' : 'Resend email'}
              </Button>
              <Button onClick={handleUpdateEmail} className='w-full font-bold' variant='outline'>
                Update email
              </Button>
            </div>
            {resendError && (
              <div className='mt-4 flex items-center justify-center text-sm text-error'>
                <FiAlertCircle className='flex-shrink-0 mr-2' />
                <p>{resendError}</p>
              </div>
            )}
            {resendSuccess && (
              <div className='mt-4 flex items-center justify-center text-sm text-primary'>
                <FiCheckCircle className='flex-shrink-0 mr-2' />
                <p>Verification email sent. Check your inbox.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
