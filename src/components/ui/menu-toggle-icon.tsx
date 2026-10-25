import React from 'react';
import { cn } from '@/lib/utils';

interface MenuToggleIconProps extends React.SVGProps<SVGSVGElement> {
  open: boolean;
  duration?: number;
}

export function MenuToggleIcon({
  open,
  duration = 300,
  className,
  ...props
}: MenuToggleIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('transition-all', className)}
      style={{ transitionDuration: `${duration}ms` }}
      {...props}
    >
      <line
        x1="4"
        y1="6"
        x2="20"
        y2="6"
        className={cn(
          'origin-center transition-all',
          open && 'translate-y-[6px] rotate-45'
        )}
        style={{ transitionDuration: `${duration}ms` }}
      />
      <line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        className={cn(
          'transition-opacity',
          open && 'opacity-0'
        )}
        style={{ transitionDuration: `${duration}ms` }}
      />
      <line
        x1="4"
        y1="18"
        x2="20"
        y2="18"
        className={cn(
          'origin-center transition-all',
          open && '-translate-y-[6px] -rotate-45'
        )}
        style={{ transitionDuration: `${duration}ms` }}
      />
    </svg>
  );
}
