'use client';

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { TemperatureChart } from '../components/Charts/TemperatureChart';
import { HumidityChart } from '../components/Charts/HumidityChart';
import { sessionAPI } from '../api/client';
import { Session } from '@/lib/types';
import { FiCalendar } from 'react-icons/fi';

export default function ChartsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const activeSession = sessions.find(s => s.status === 'running');
      if (activeSession) {
        setSelectedSessionId(activeSession.id);
      } else if (sessions[0]) {
        setSelectedSessionId(sessions[0].id);
      }
    }
  }, [sessions, selectedSessionId]);

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.list({ limit: 20 });
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics & Charts</h1>
        <div className="flex items-center gap-4">
          {/* Date range selector */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateRange === range
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Session Selector */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-gray-400" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Session
              </label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="block w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? (
                  <option>Loading sessions...</option>
                ) : (
                  <>
                    <option value="">Select a session</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        Session #{session.id.slice(-6)} - {session.status} - {session.days_elapsed}/{session.expected_hatch_days} days
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          {selectedSession && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{selectedSession.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <p className="font-medium">{selectedSession.progress_percentage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Eggs</p>
                <p className="font-medium">{selectedSession.number_of_eggs}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Days Left</p>
                <p className="font-medium">{selectedSession.days_remaining}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <TemperatureChart sessionId={selectedSessionId} />
        </Card>
        <Card>
          <HumidityChart sessionId={selectedSessionId} />
        </Card>
      </div>

      {/* Stats Summary */}
      {selectedSession && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Session Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {selectedSession.days_elapsed}
              </p>
              <p className="text-sm text-gray-600">Days Elapsed</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {selectedSession.days_remaining}
              </p>
              <p className="text-sm text-gray-600">Days Remaining</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {selectedSession.progress_percentage.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Progress</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {selectedSession.number_of_eggs}
              </p>
              <p className="text-sm text-gray-600">Total Eggs</p>
            </div>
          </div>
        </Card>
      )}

      {!loading && sessions.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-600">No Data Available</h3>
            <p className="text-gray-500 mt-2">Start an incubation session to see charts and analytics.</p>
          </div>
        </Card>
      )}
    </div>
  );
}