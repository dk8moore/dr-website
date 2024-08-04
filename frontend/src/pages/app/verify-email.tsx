import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@api';
import { Button } from '@ui/button';
import { Card } from '@ui/card';

export function VerifyEmail() {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.auth.verifyEmail(key || '');
        if (response.success) {
          setVerificationStatus('success');
        } else {
          setVerificationStatus('error');
        }
      } catch (error) {
        setVerificationStatus('error');
      }
    };

    if (key) {
      verifyEmail();
    }
  }, [key]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-background'>
      <Card className='w-full max-w-md p-8'>
        {verificationStatus === 'verifying' && <p>Verifying your email...</p>}
        {verificationStatus === 'success' && (
          <>
            <h2 className='text-2xl font-bold mb-4'>Email Verified Successfully</h2>
            <p className='mb-4'>Your email has been verified. You can now log in to your account.</p>
            <Button onClick={handleLoginClick}>Go to Login</Button>
          </>
        )}
        {verificationStatus === 'error' && (
          <>
            <h2 className='text-2xl font-bold mb-4'>Verification Failed</h2>
            <p className='mb-4'>There was an error verifying your email. Please try again or contact support.</p>
          </>
        )}
      </Card>
    </div>
  );
}
