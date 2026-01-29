'use client';

import { Session } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  FiCalendar, 
  FiClock, 
  FiTrendingUp,
  FiMoreVertical,
  FiTrash2,
  FiEdit
} from 'react-icons/fi';
import { FaEgg } from 'react-icons/fa';
import { DeleteSessionModal } from './DeleteSessionModal';

interface SessionCardProps {
  session: Session;
  onDelete?: () => void;
}

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'stopped':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteSuccess = () => {
    if (onDelete) {
      onDelete();
    }
    // If we're on the session detail page, redirect to sessions list
    if (window.location.pathname.includes(session.id)) {
      router.push('/sessions');
    }
  };

  return (
    <>
      <div className="p-6 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              session.status === 'running' ? 'bg-green-500 animate-pulse' :
              session.status === 'completed' ? 'bg-blue-500' :
              'bg-gray-400'
            }`} />
            <Link href={`/sessions/${session.id}`} className="hover:underline">
              <div>
                <h3 className="font-semibold">Session #{session.id.slice(-6)}</h3>
                <p className="text-sm text-gray-500">
                  Started {format(new Date(session.start_time), 'MMM d, yyyy')}
                </p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(session.status)}`}>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </span>
            
            {/* Action Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiMoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <>
                  {/* Click outside to close */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          router.push(`/sessions/${session.id}`);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiEdit className="w-4 h-4" />
                        View Details
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowDeleteModal(true);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Delete Session
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <FaEgg className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Eggs</p>
              <p className="font-medium">{session.number_of_eggs}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FiCalendar className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{session.expected_hatch_days} days</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FiClock className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Elapsed</p>
              <p className="font-medium">{session.days_elapsed} days</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="font-medium">{session.progress_percentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Progress</span>
            <span>{session.progress_percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                session.status === 'completed' ? 'bg-blue-600' : 
                session.status === 'stopped' ? 'bg-gray-400' : 'bg-green-600'
              }`}
              style={{ width: `${session.progress_percentage}%` }}
            />
          </div>
        </div>
      </div>

      <DeleteSessionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        sessionId={session.id}
        sessionName={`#${session.id.slice(-6)}`}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}