import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Button, ButtonProps } from '@ui/button';
import { cn } from "@lib/utils";
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/* This is a DR component extending the Shadcn Button component */

export interface FeedbackButtonProps extends ButtonProps {
    onClickAsync?: (e?: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    loadingText?: string | React.ReactNode;
    successText?: string | React.ReactNode;
    errorText?: string | React.ReactNode;
    idleText?: string | React.ReactNode;
  }
  
  export interface FeedbackButtonRef {
    reset: () => void;
  }
  
  export const FeedbackButton = forwardRef<FeedbackButtonRef, FeedbackButtonProps>(({
    children,
    onClickAsync,
    loadingText,
    successText,
    errorText,
    idleText,
    className,
    ...props
  }, ref) => {
    const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
    useEffect(() => {
      if (state === 'success' || state === 'error') {
        const timer = setTimeout(() => setState('idle'), 10000);
        return () => clearTimeout(timer);
      }
    }, [state]);
  
    useImperativeHandle(ref, () => ({
      reset: () => setState('idle')
    }));
  
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClickAsync) {
        setState('loading');
        try {
          await onClickAsync();
          setState('success');
        } catch (error) {
          setState('error');
        }
      }
    };
  
    const getContent = () => {
      switch (state) {
        case 'loading':
          return (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {loadingText || 'Loading...'}
            </>
          );
        case 'success':
          return (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {successText || 'Success!'}
            </>
          );
        case 'error':
          return (
            <>
              <XCircle className="mr-2 h-4 w-4" />
              {errorText || 'Error'}
            </>
          );
        default:
          return idleText || children;
      }
    };
  
    const getStateStyles = () => {
      switch (state) {
        case 'loading':
          return 'opacity-80 cursor-not-allowed';
        case 'success':
          return 'bg-green-500 hover:bg-green-600';
        case 'error':
          return 'bg-red-500 hover:bg-red-600';
        default:
          return '';
      }
    };
  
    return (
      <Button
        className={cn(getStateStyles(), 'transition-all duration-300', className)}
        onClick={handleClick}
        disabled={state === 'loading'}
        {...props}
      >
        {getContent()}
      </Button>
    );
  });
  
  FeedbackButton.displayName = 'FeedbackButton';