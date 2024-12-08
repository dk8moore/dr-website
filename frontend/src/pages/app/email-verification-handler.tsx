import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@api';
import { getWebSocket } from '@lib/websocket';
import { logger } from '@/lib/logger';

import { Button } from '@ui/button';
import { Card } from '@ui/card';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

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
        logger.error('An error occurred during email verification:', error);
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
    <div className='flex dotted-background items-center justify-center min-h-screen min-w-[400px] px-4 py-12 relative'>
      <div className='absolute inset-0 lg:hidden'>
        <img src='https://picsum.photos/1080/1920' alt='Background Image' className='w-full h-full object-cover opacity-20' />
      </div>
      <Card className='flex items-center max-w-md rounded-lg shadow-lg overflow-hidden z-10'>
        <div className='flex flex-col justify-center mx-auto w-full max-w-md p-8'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4'>
              {verificationStatus === 'success' ? (
                <FiCheckCircle className='w-8 h-8 text-primary' />
              ) : verificationStatus === 'error' ? (
                <FiAlertCircle className='w-8 h-8 text-error' />
              ) : (
                <span className='text-2xl'>Logo</span>
              )}
            </div>

            {verificationStatus === 'verifying' && <h4 className='text-2xl font-semibold text-card-foreground'>Verifying your email...</h4>}

            {verificationStatus === 'success' && (
              <>
                <h4 className='text-2xl font-semibold text-card-foreground'>Email Verified Successfully</h4>
                <p className='font-light mt-2 text-muted-foreground'>Your email has been verified. You can now log in to your account.</p>
                <Button onClick={handleContinue} className='w-full mt-4 font-bold bg-primary'>
                  Continue to Login
                </Button>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <h4 className='text-2xl font-semibold text-card-foreground'>Verification Failed</h4>
                <p className='font-light mt-2 text-error'>{errorMessage || 'An error occurred during email verification.'}</p>
                <Button onClick={() => navigate('/signup')} className='w-full mt-4 font-bold bg-primary'>
                  Back to Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
