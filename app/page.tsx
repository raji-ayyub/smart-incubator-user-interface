'use client';

import { useState, useEffect } from 'react';
import { CurrentSession } from './components/dashboard/CurrentSession';
import { SensorReadings } from './components/dashboard/SensorReadings';
import { ProgressCard } from './components/dashboard/ProgressCard';
import { StartSessionButton } from './components/sessions/StartSessionButton';
import { sessionAPI } from './api/client';
import { FiActivity } from 'react-icons/fi';

export default function Dashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.list({ limit: 5 });
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSessionSuccess = () => {
    // Refresh dashboard data
    fetchSessions();
    // You could also add a toast notification here
    console.log('New session created successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <FiActivity className="text-white" />
            </div>
            Incubator Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage your incubation sessions</p>
        </div>
        
        <StartSessionButton 
          onSuccess={handleNewSessionSuccess}
          size="lg"
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Sessions</p>
              <p className="text-2xl font-bold mt-1">
                {sessions.filter(s => s.status === 'running').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FiActivity className="text-xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Eggs</p>
              <p className="text-2xl font-bold mt-1">
                {sessions.reduce((sum, session) => sum + session.number_of_eggs, 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Progress</p>
              <p className="text-2xl font-bold mt-1">
                {sessions.length > 0
                  ? Math.round(sessions.reduce((sum, s) => sum + s.progress_percentage, 0) / sessions.length)
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold mt-1">
                {sessions.length > 0
                  ? Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100)
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>


        
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CurrentSession />
          <SensorReadings />

           {/* Tips & Guidance */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">💡 Incubation Tips</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <li className="flex items-start gap-2">
            <div className="p-1 bg-blue-100 rounded">
              <FiActivity className="text-blue-600" />
            </div>
            <span>Optimal temperature: 37.5-38°C</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="p-1 bg-blue-100 rounded">
              <FiActivity className="text-blue-600" />
            </div>
            <span>Optimal humidity: 50-60%</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="p-1 bg-blue-100 rounded">
              <FiActivity className="text-blue-600" />
            </div>
            <span>Turn eggs 3-5 times daily</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="p-1 bg-blue-100 rounded">
              <FiActivity className="text-blue-600" />
            </div>
            <span>Stop turning 3 days before hatch</span>
          </li>
        </ul>
      </div>
        </div>
        <div className="space-y-6">
          <ProgressCard />
          
          {/* Quick Start */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  // This could open the modal with preset values
                  console.log('Quick start: Chicken');
                }}
                className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <FiActivity className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Start Chicken Incubation</p>
                    <p className="text-sm text-gray-500">21 days, 12 eggs</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  console.log('Quick start: Duck');
                }}
                className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Start Duck Incubation</p>
                    <p className="text-sm text-gray-500">28 days, 8 eggs</p>
                  </div>
                </div>
              </button>
              
              <StartSessionButton 
                onSuccess={handleNewSessionSuccess}
                variant="secondary"
                size="md"
              />
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Sessions</h3>
              <span className="text-sm text-gray-500">
                {sessions.length} total
              </span>
            </div>
            
            {loading ? (
              <div className="py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No sessions yet</p>
                <p className="text-sm text-gray-400 mt-1">Start your first incubation session</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Session #{session.id.slice(-6)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            session.status === 'running' ? 'bg-green-100 text-green-800' :
                            session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {session.number_of_eggs} eggs
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {session.progress_percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            session.status === 'running' ? 'bg-green-500' :
                            session.status === 'completed' ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${session.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {sessions.length > 3 && (
                  <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                    View all sessions →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

     
    </div>
  );
}