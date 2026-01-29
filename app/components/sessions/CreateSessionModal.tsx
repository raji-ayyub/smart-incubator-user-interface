'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { sessionAPI } from '@/app/api/client';
import { FiX, FiCalendar, FiPlay } from 'react-icons/fi';
// import {FaEgg} from 'react-icons/fa'

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSessionModal({ isOpen, onClose, onSuccess }: CreateSessionModalProps) {
  const [formData, setFormData] = useState({
    expected_hatch_days: 21,
    number_of_eggs: 12,
    status: 'running' as 'running' | 'completed' | 'stopped',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.expected_hatch_days || formData.expected_hatch_days < 1 || formData.expected_hatch_days > 100) {
      newErrors.expected_hatch_days = 'Hatch days must be between 1 and 100';
    }

    if (!formData.number_of_eggs || formData.number_of_eggs < 1 || formData.number_of_eggs > 1000) {
      newErrors.number_of_eggs = 'Number of eggs must be between 1 and 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await sessionAPI.create({
        expected_hatch_days: formData.expected_hatch_days,
        number_of_eggs: formData.number_of_eggs,
        status: formData.status,
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create session:', error);
      setErrors({ submit: 'Failed to create session. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      expected_hatch_days: 21,
      number_of_eggs: 12,
      status: 'running',
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const eggPresets = [
    { label: 'Small Batch', value: 6 },
    { label: 'Standard', value: 12 },
    { label: 'Large Batch', value: 24 },
    { label: 'Commercial', value: 48 },
  ];

  const hatchPresets = [
    { label: 'Chicken (21 days)', value: 21 },
    { label: 'Duck (28 days)', value: 28 },
    { label: 'Turkey (28 days)', value: 28 },
    { label: 'Quail (18 days)', value: 18 },
    { label: 'Goose (30 days)', value: 30 },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FiCalendar className="text-xl text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Start New Incubation</h3>
                <p className="text-sm text-gray-500">Configure your incubation session</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Expected Hatch Days */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incubation Duration
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {hatchPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      expected_hatch_days: preset.value 
                    }))}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      formData.expected_hatch_days === preset.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.expected_hatch_days}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      expected_hatch_days: parseInt(e.target.value) || 0 
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter custom days"
                  />
                </div>
                <span className="text-gray-500 whitespace-nowrap">days</span>
              </div>
              
              {errors.expected_hatch_days && (
                <p className="mt-1 text-sm text-red-600">{errors.expected_hatch_days}</p>
              )}
            </div>

            {/* Number of Eggs */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Eggs
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {eggPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      number_of_eggs: preset.value 
                    }))}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      formData.number_of_eggs === preset.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.number_of_eggs}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      number_of_eggs: parseInt(e.target.value) || 0 
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter custom number"
                  />
                </div>
                <span className="text-gray-500 whitespace-nowrap">eggs</span>
              </div>
              
              {errors.number_of_eggs && (
                <p className="mt-1 text-sm text-red-600">{errors.number_of_eggs}</p>
              )}
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Status
              </label>
              <div className="flex gap-2">
                {(['running', 'completed', 'stopped'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status }))}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                      formData.status === status
                        ? status === 'running'
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : status === 'completed'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-gray-50 border-gray-500 text-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-medium capitalize">{status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Session Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{formData.expected_hatch_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Eggs:</span>
                  <span className="font-medium">{formData.number_of_eggs} eggs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium capitalize ${
                    formData.status === 'running' ? 'text-green-600' :
                    formData.status === 'completed' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {formData.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex-1"
              >
                <FiPlay className="mr-2" />
                Start Incubation
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}