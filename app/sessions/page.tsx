'use client';

import { useState, useEffect } from 'react';
import { Session } from '@/lib/types';
import { sessionAPI } from '../api/client';
import { SessionList } from '../components/sessions/SessionList';
import { StartSessionButton } from '../components/sessions/StartSessionButton';
import { FiFilter, FiDownload, FiSearch } from 'react-icons/fi';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'progress'>('newest');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.list({ limit: 100 });
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSessionSuccess = () => {
    fetchSessions();
    // Show success message
    console.log('New session created!');
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.number_of_eggs.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'progress':
        return b.progress_percentage - a.progress_percentage;
      default:
        return 0;
    }
  });

  const getStats = () => {
    const total = sessions.length;
    const running = sessions.filter(s => s.status === 'running').length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const stopped = sessions.filter(s => s.status === 'stopped').length;
    const totalEggs = sessions.reduce((sum, s) => sum + s.number_of_eggs, 0);
    
    return { total, running, completed, stopped, totalEggs };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Incubation Sessions</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all your incubation sessions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <StartSessionButton 
            onSuccess={handleNewSessionSuccess}
            size="lg"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sessions</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FiFilter className="text-xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Sessions</p>
              <p className="text-2xl font-bold mt-1">{stats.running}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Eggs</p>
              <p className="text-2xl font-bold mt-1">{stats.totalEggs}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions or eggs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="stopped">Stopped</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="progress">Progress</option>
              </select>
            </div>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FiDownload />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Loading sessions...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-600">No Sessions Found</h3>
            <p className="text-gray-500 mt-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Start your first incubation session'
              }
            </p>
            {(searchTerm || statusFilter !== 'all') ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            ) : (
              <div className="mt-4">
                <StartSessionButton 
                  onSuccess={handleNewSessionSuccess}
                  variant="primary"
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="p-4 border-b flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Showing {filteredSessions.length} of {sessions.length} sessions
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Total eggs in view: {filteredSessions.reduce((sum, s) => sum + s.number_of_eggs, 0)}
                </span>
              </div>
            </div>
            <SessionList sessions={sortedSessions} loading={false} />
          </>
        )}
      </div>

      {/* Empty State Call to Action */}
      {sessions.length === 0 && !loading && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFilter className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to start incubating?</h3>
            <p className="text-gray-600 mb-6">
              Create your first incubation session to begin monitoring temperature, humidity, and progress.
            </p>
            <StartSessionButton 
              onSuccess={handleNewSessionSuccess}
              size="lg"
            />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="p-3 bg-white rounded-lg">
                <div className="font-medium mb-1">Monitor Conditions</div>
                <div>Track temperature & humidity in real-time</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="font-medium mb-1">Progress Tracking</div>
                <div>Visualize incubation progress with charts</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="font-medium mb-1">Session History</div>
                <div>Review past sessions and outcomes</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}