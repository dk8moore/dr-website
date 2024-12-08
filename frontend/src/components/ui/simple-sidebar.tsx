import { cn } from '@lib/utils';
import Link, { LinkProps } from 'next/link';
import React, { useState, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconMenu2, IconX } from '@tabler/icons-react';

/* From Aceternity UI => https://ui.aceternity.com/components/sidebar */

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SimpleSidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SimpleSidebarContext = createContext<SimpleSidebarContextProps | undefined>(undefined);

export const useSimpleSidebar = () => {
  const context = useContext(SimpleSidebarContext);
  if (!context) {
    throw new Error('useSimpleSidebar must be used within a SimpleSidebarProvider');
  }
  return context;
};

export const SimpleSidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return <SimpleSidebarContext.Provider value={{ open, setOpen, animate: animate }}>{children}</SimpleSidebarContext.Provider>;
};

export const SimpleSidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SimpleSidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SimpleSidebarProvider>
  );
};

export const SimpleSidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSimpleSidebar {...props} />
      <MobileSimpleSidebar {...(props as React.ComponentProps<'div'>)} />
    </>
  );
};

export const DesktopSimpleSidebar = ({ className, children, ...props }: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSimpleSidebar();
  return (
    <>
      <motion.div
        className={cn('h-full px-4 py-4 hidden  md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] flex-shrink-0', className)}
        animate={{
          width: animate ? (open ? '300px' : '60px') : '300px',
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSimpleSidebar = ({ className, children, ...props }: React.ComponentProps<'div'>) => {
  const { open, setOpen } = useSimpleSidebar();
  return (
    <>
      <div
        className={cn('h-10 px-4 py-4 flex flex-row md:hidden  items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full')}
        {...props}
      >
        <div className='flex justify-end z-20 w-full'>
          <IconMenu2 className='text-neutral-800 dark:text-neutral-200' onClick={() => setOpen(!open)} />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
              }}
              className={cn('fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between', className)}
            >
              <div className='absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200' onClick={() => setOpen(!open)}>
                <IconX />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SimpleSidebarLink = ({ link, className, ...props }: { link: Links; className?: string; props?: LinkProps }) => {
  const { open, animate } = useSimpleSidebar();
  return (
    <Link href={link.href} className={cn('flex items-center justify-start gap-2  group/sidebar py-2', className)} {...props}>
      {link.icon}

      <motion.span
        animate={{
          display: animate ? (open ? 'inline-block' : 'none') : 'inline-block',
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className='text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0'
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
