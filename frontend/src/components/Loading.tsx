import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  text,
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          border-gray-300
          border-t-blue-500
          rounded-full
          animate-spin
        `}
        role="status"
        aria-label="loading"
      />
      {text && (
        <p
          className={`
            mt-2
            ${textSizes[size]}
            text-gray-600
            font-medium
          `}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;

// Usage example:
// <Loading size="small" text="Loading..." />
// <Loading size="medium" />
// <Loading size="large" text="Please wait..." className="mt-4" />