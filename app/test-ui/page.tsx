'use client';

import React, { useState } from 'react';
import Loading from '../components/ui/Loading';
import ConfirmAlert from '../components/ui/ConfirmAlert';

export default function TestUIPage() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'none' | 'inline' | 'full'>('none');

  const handleConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsConfirmOpen(false);
      alert('Confirmed!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">UI Components Test</h1>

      <section className="mb-12 space-y-4">
        <h2 className="text-xl font-semibold">Loading Component</h2>
        <div className="flex gap-4 items-center p-6 bg-white rounded-xl shadow-sm">
          <Loading size="sm" />
          <Loading size="md" />
          <Loading size="lg" />
          <Loading size="xl" />
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => setLoadingType('full')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Test Full Screen Loading (3s)
            </button>
        </div>
        {loadingType === 'full' && (
            <Loading fullScreen />
        )}
        {loadingType === 'full' && (() => {
            setTimeout(() => setLoadingType('none'), 3000);
            return null;
        })()}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Confirm Alert</h2>
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg shadow-red-200"
          >
            Delete Account (danger)
          </button>
        </div>

        <ConfirmAlert
          isOpen={isConfirmOpen}
          title="Delete Account"
          message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
          confirmText="Yes, delete everything"
          cancelText="No, keep it"
          type="danger"
          onConfirm={handleConfirm}
          onCancel={() => setIsConfirmOpen(false)}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
}
