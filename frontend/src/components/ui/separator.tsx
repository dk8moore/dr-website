'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

import { cn } from '@lib/utils';

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, children, ...props }, ref) => {
  const hasChildren = React.Children.count(children) > 0;

  return (
    <div className={cn('flex items-center', orientation === 'horizontal' ? 'w-full' : 'h-full')}>
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          'shrink-0 bg-border',
          orientation === 'horizontal' ? 'h-[1px] w-full flex-1' : 'h-full w-[1px]',
          className
        )}
        {...props}
      />
      {hasChildren && orientation === 'horizontal' && <span className='mx-2'>{children}</span>}
      {hasChildren && orientation === 'horizontal' && (
        <SeparatorPrimitive.Root
          decorative={decorative}
          orientation={orientation}
          className={cn('shrink-0 bg-border', 'h-[1px] w-full flex-1', className)}
          {...props}
        />
      )}
    </div>
  );
});
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
