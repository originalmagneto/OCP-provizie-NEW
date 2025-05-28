import { Loader2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const spinTransition = {
  repeat: Infinity,
  ease: 'linear',
  duration: 0.8,
};

const spinVariants: Variants = {
  spin: {
    rotate: 360,
    transition: spinTransition,
  },
};

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <motion.span
        className={`${sizeMap[size]} text-primary`}
        animate="spin"
        variants={spinVariants}
      >
        <Loader2 className="h-full w-full" />
      </motion.span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner size="lg" className="text-primary" />
    </div>
  );
}
