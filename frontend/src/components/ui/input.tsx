import * as React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

/** From shadcn.ui but edited to provide additional functionalities: shake on demand, error; password component with toggle for visibility */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  isShaking?: boolean;
  onAnimationEnd?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, isError, isShaking, onAnimationEnd, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        isError && 'border-[hsl(var(--error))]',
        isShaking && 'animate-shake',
        className
      )}
      ref={ref}
      onAnimationEnd={onAnimationEnd}
      {...props}
    />
  );
});
Input.displayName = 'Input';

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(({ className, isError, isShaking, onAnimationEnd, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className='relative'>
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn('pr-10', className)}
        ref={ref}
        isError={isError}
        isShaking={isShaking}
        onAnimationEnd={onAnimationEnd}
        {...props}
      />
      <button
        type='button'
        onClick={() => setShowPassword(!showPassword)}
        className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400'
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

export { Input, PasswordInput };
