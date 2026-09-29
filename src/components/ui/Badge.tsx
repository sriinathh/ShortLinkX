import { type ReactNode } from 'react';

type Variant = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'accent';

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

const variants: Record<Variant, string> = {
  default: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  brand: 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300',
  success: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
  danger: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
  accent: 'bg-accent-50 dark:bg-accent-950 text-accent-600 dark:text-accent-400',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
