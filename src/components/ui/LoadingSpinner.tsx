import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={clsx('animate-spin rounded-full border-2 border-gray-300 border-t-primary-600', sizeClasses[size], className)}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}; 