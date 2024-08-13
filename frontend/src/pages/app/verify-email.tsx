import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@api';
import { initializeWebSocket, closeWebSocket } from '@lib/websocket';
import { logger } from '@lib/logger';

import { Card } from '@ui/card';
import { FiMail, FiChevronLeft } from 'react-icons/fi';
import { Button } from '@ui/button';
import { FeedbackButton, FeedbackButtonRef } from '@ui/feedback-button';

export function VerifyEmail() {
  const [email, setEmail] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const feedbackButtonRef = useRef<FeedbackButtonRef>(null);

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
        navigate('/login', { state: { email } });
      }
    };

    return () => {
      closeWebSocket();
    };
  }, [location, navigate]);

  const handleResendEmail = async () => {
    if (!email) return;
    try {
      const response = await api.auth.resendVerificationEmail(email);
      if (!response.success) {
        throw new Error(response.error || 'Failed to resend verification email');
      }
    } catch (error) {
      logger.error('Failed to resend verification email:', error);
      throw error;
    }
  };

  const handleBackToSignup = () => {
    navigate('/signup');
  };

  if (!email) {
    return null; // or a loading spinner
  }

  return (
    <div className='flex dotted-background items-center justify-center min-h-screen min-w-[400px] px-4 py-12 relative'>
      <div className='absolute inset-0 lg:hidden'>
        <img src='https://picsum.photos/1080/1920' alt='Background Image' className='w-full h-full object-cover opacity-20' />
      </div>
      <Card className='flex items-center max-w-md rounded-lg shadow-lg overflow-hidden z-10'>
        <div className='relative flex flex-col justify-center mx-auto w-full max-w-md p-8'>
          <Button
            onClick={handleBackToSignup}
            className='absolute top-2 left-2 p-2 text-primary hover:bg-secondary transition-colors duration-200'
            variant='ghost'
            aria-label='Back to signup'
          >
            {<FiChevronLeft className='w-5 h-5' />}
          </Button>
          <div className='text-center mt-6'>
            <div className='w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4'>
              <FiMail className='w-8 h-8 text-primary' />
            </div>
            <h4 className='text-2xl font-semibold text-card-foreground'>Please verify your email</h4>
            <p className='font-light mt-2 text-muted-foreground'>
              We just sent an email to <em className='font-bold italic'>{email}</em>.<br />
              Click the link in the email to verify your account.
            </p>
            <div className='mt-6 space-y-2'>
              <FeedbackButton
                ref={feedbackButtonRef}
                onClickAsync={handleResendEmail}
                loadingText='Sending...'
                successText='Email sent successfully!'
                errorText='Failed to send email'
                idleText='Resend email'
                className='w-full font-bold bg-primary'
              />
            </div>
            <p className='mt-6 text-sm text-muted-foreground'>
              Wrong email?{' '}
              <span className='font-bold cursor-pointer text-primary hover:underline' onClick={handleBackToSignup}>
                Back to signup
              </span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
