import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@ui/card';
import { FeedbackButton } from '@ui/feedback-button';
import api from '@api';
import { initializeWebSocket, closeWebSocket } from '@lib/websocket';

export function VerifyEmail() {
  const [email, setEmail] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
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
    if (!email) return Promise.reject('No email provided');
    try {
      await api.auth.resendVerificationEmail(email);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const handleUpdateEmail = () => {
    // Implement the logic to update email
    // For now, we'll just redirect to the signup page
    navigate('/signup');
  };

  if (isVerified) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-background'>
        <Card className='w-full max-w-md p-8 bg-[#1A1C1E] text-white'>
          <CardContent className='flex flex-col items-center space-y-6'>
            <h2 className='text-2xl font-bold text-center'>Email Verified Successfully</h2>
            <p className='text-center text-gray-400'>Your email has been verified. You can now log in to your account.</p>
            <button className='w-full py-2 px-4 bg-white text-black rounded hover:bg-gray-200' onClick={() => navigate('/login')}>
              Continue to Login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!email) {
    return null; // or a loading spinner
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-background'>
      <Card className='w-full max-w-md p-8 bg-[#1A1C1E] text-white'>
        <CardContent className='flex flex-col items-center space-y-6'>
          {/* Placeholder for logo */}
          <div className='w-16 h-16 bg-[#27292B] rounded-full flex items-center justify-center'>
            <span className='text-2xl'>Logo</span>
          </div>

          <h2 className='text-2xl font-bold text-center'>Please verify your email</h2>

          <p className='text-center text-gray-400'>
            We just sent an email to {email}.<br />
            Click the link in the email to verify your account.
          </p>

          <div className='flex space-x-4 w-full'>
            <FeedbackButton
              className='flex-1 bg-white text-black hover:bg-gray-200'
              onClickAsync={handleResendEmail}
              loadingText='Sending...'
              successText='Email Sent'
              errorText='Failed to Send'
            >
              Resend email
            </FeedbackButton>

            <FeedbackButton className='flex-1 bg-[#27292B] hover:bg-[#3A3C3E]' onClick={handleUpdateEmail}>
              Update email
            </FeedbackButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
