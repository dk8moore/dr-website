import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@ui/card';
import api from '@api';
import { getWebSocket } from '@lib/websocket';

export function EmailVerificationHandler() {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!key) {
        setVerificationStatus('error');
        setErrorMessage('Verification key is missing');
        return;
      }

      try {
        const response = await api.auth.verifyEmail(key);
        if (response.success) {
          setVerificationStatus('success');
          // Send WebSocket message
          const socket = getWebSocket();
          if (socket) {
            socket.send(
              JSON.stringify({
                type: 'email_verified',
                message: 'Email has been verified',
              })
            );
          }
        } else {
          setVerificationStatus('error');
          setErrorMessage(response.error || 'Verification failed');
        }
      } catch (error) {
        setVerificationStatus('error');
        setErrorMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [key]);

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-background'>
      <Card className='w-full max-w-md p-8 bg-[#1A1C1E] text-white'>
        <CardContent className='flex flex-col items-center space-y-6'>
          <div className='w-16 h-16 bg-[#27292B] rounded-full flex items-center justify-center'>
            <span className='text-2xl'>Logo</span>
          </div>

          {verificationStatus === 'verifying' && <p className='text-center'>Verifying your email...</p>}

          {verificationStatus === 'success' && (
            <>
              <h2 className='text-2xl font-bold text-center'>Email Verified Successfully</h2>
              <p className='text-center text-gray-400'>Your email has been verified. You can now log in to your account.</p>
              <button className='w-full py-2 px-4 bg-white text-black rounded hover:bg-gray-200' onClick={handleContinue}>
                Continue to Login
              </button>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <h2 className='text-2xl font-bold text-center'>Verification Failed</h2>
              <p className='text-center text-gray-400'>{errorMessage || 'An error occurred during email verification.'}</p>
              <button className='w-full py-2 px-4 bg-white text-black rounded hover:bg-gray-200' onClick={() => navigate('/signup')}>
                Back to Sign Up
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
