'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { sessionAPI } from '@/app/api/client';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';

interface DeleteSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionName: string;
  onSuccess: () => void;
}

export function DeleteSessionModal({ 
  isOpen, 
  onClose, 
  sessionId, 
  sessionName,
  onSuccess 
}: DeleteSessionModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      await sessionAPI.delete(sessionId);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to delete session:', error);
      setError(
        error.response?.data?.detail || 
        'Failed to delete session. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <FiAlertTriangle className="text-xl text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Delete Session</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete session <span className="font-semibold">{sessionName}</span>?
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="text-sm text-red-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <FiAlertTriangle className="flex-shrink-0 mt-0.5" />
                    <span>All session data will be permanently deleted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiAlertTriangle className="flex-shrink-0 mt-0.5" />
                    <span>All associated sensor readings will be deleted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiAlertTriangle className="flex-shrink-0 mt-0.5" />
                    <span>This action cannot be undone</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="flex-1"
              >
                <FiTrash2 className="mr-2" />
                Delete Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}