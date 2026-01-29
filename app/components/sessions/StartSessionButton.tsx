'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { CreateSessionModal } from './CreateSessionModal';
import { FiPlus } from 'react-icons/fi';

interface StartSessionButtonProps {
  onSuccess?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function StartSessionButton({ 
  onSuccess, 
  variant = 'primary',
  size = 'md'
}: StartSessionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setIsModalOpen(false);
    if (onSuccess) {
      onSuccess();
    }
    // You could also trigger a global refresh or show a toast here
  };

  const buttonSizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={variant}
        className={`flex items-center gap-2 ${buttonSizes[size]}`}
      >
        <FiPlus />
        New Session
      </Button>

      <CreateSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}