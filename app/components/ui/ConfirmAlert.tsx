'use client';

import React, { useEffect, useState } from 'react';

interface ConfirmAlertProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'success' | 'warning';
  isLoading?: boolean;
}

const ConfirmAlert: React.FC<ConfirmAlertProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to allow render before animation starts
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          button: 'bg-red-500 hover:bg-red-600 text-white shadow-red-200',
          icon: 'text-red-500 bg-red-100',
          ring: 'ring-red-500',
        };
      case 'success':
        return {
          button: 'bg-green-500 hover:bg-green-600 text-white shadow-green-200',
          icon: 'text-green-500 bg-green-100',
          ring: 'ring-green-500',
        };
      case 'warning':
        return {
          button: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-200',
          icon: 'text-yellow-600 bg-yellow-100',
          ring: 'ring-yellow-500',
        };
      default:
        return {
          button: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200',
          icon: 'text-indigo-600 bg-indigo-100',
          ring: 'ring-indigo-600',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 transition-all duration-300 ease-out bg-black/20 backdrop-blur-sm
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={!isLoading ? onCancel : undefined}
      />

      {/* Modal Panel */}
      <div 
        className={`relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isAnimating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
        `}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            {/* Icon Wrapper */}
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.icon}`}>
              {type === 'danger' && (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              )}
              {type === 'success' && (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
              {(type === 'info' || type === 'warning') && (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              )}
            </div>

            <div className="mt-1 flex-1">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                {title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isLoading}
              className="inline-flex w-full justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-colors sm:w-auto active:scale-95 disabled:opacity-50"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={isLoading}
              className={`inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg shadow-opacity-20 transition-all hover:bg-opacity-90 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed sm:w-auto ${styles.button}`}
              onClick={onConfirm}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAlert;
