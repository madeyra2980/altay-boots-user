import React from 'react';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  className = '', 
  size = 'md', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-[5px]',
  };

  const spinner = (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full border-gray-200/30 border-t-orange-500 animate-spin`}
        aria-label="Loading"
      />
      {/* Optional internal glow or second ring for premium feel */}
      <div 
        className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-gray-200/10 border-b-orange-300/50 animate-spin-reverse`}
        style={{ animationDuration: '1.5s' }}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm transition-all duration-300">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-sm font-medium text-gray-500 animate-pulse">Загрузка...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default Loading;
