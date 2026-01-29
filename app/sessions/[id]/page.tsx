'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { DeleteSessionModal } from '@/app/components/sessions/DeleteSessionModal';
import { sessionAPI, readingAPI } from '@/app/api/client';
import { Session, Reading } from '@/lib/types';
import { format } from 'date-fns';
import { 
  FiCalendar, 
  FiClock, 
  FiThermometer, 
  FiDroplet,
  FiChevronLeft,
  FiRefreshCw,
  FiPlay,
  FiStopCircle,
  FiCheckCircle,
  FiTrash2,
  FiEdit,
  FiBarChart2
} from 'react-icons/fi';

import { FaEgg } from 'react-icons/fa';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [recentReadings, setRecentReadings] = useState<Reading[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
      const interval = setInterval(fetchSessionData, 10000);
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      const sessionResponse = await sessionAPI.get(sessionId);
      setSession(sessionResponse.data);
      
      const readingsResponse = await readingAPI.getHistory(sessionId, { limit: 10 });
      setRecentReadings(readingsResponse.data);
      
      if (readingsResponse.data.length > 0) {
        setLatestReading(readingsResponse.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'running' | 'completed' | 'stopped') => {
    setUpdating(true);
    try {
      await sessionAPI.update(sessionId, { status: newStatus });
      await fetchSessionData();
    } catch (error) {
      console.error('Failed to update session:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSimulateReading = async () => {
    setSimulating(true);
    try {
      await readingAPI.simulate(sessionId);
      await fetchSessionData();
    } catch (error) {
      console.error('Failed to simulate reading:', error);
    } finally {
      setSimulating(false);
    }
  };

  const handleDeleteSession = async () => {
    try {
      await sessionAPI.delete(sessionId);
      router.push('/sessions');
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Not Found</h2>
        <p className="text-gray-600 mb-6">The requested session could not be found.</p>
        <Button onClick={() => router.push('/sessions')}>
          <FiChevronLeft className="mr-2" />
          Back to Sessions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/sessions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiChevronLeft />
            Back to Sessions
          </button>
          <h1 className="text-3xl font-bold">Session Details</h1>
          <p className="text-gray-600">
            Started on {format(new Date(session.start_time), 'MMMM d, yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full font-medium ${
            session.status === 'running' ? 'bg-green-100 text-green-800' :
            session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
          
          <Button
            onClick={handleSimulateReading}
            isLoading={simulating}
            variant="secondary"
          >
            <FiRefreshCw className="mr-2" />
            Simulate Reading
          </Button>
          
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <FiTrash2 className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Controls */}
      {session.status === 'running' && (
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">Session Controls</h3>
              <p className="text-sm text-gray-600">Update the status of this incubation session</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleUpdateStatus('stopped')}
                variant="danger"
                isLoading={updating}
              >
                <FiStopCircle className="mr-2" />
                Stop Session
              </Button>
              <Button
                onClick={() => handleUpdateStatus('completed')}
                variant="primary"
                isLoading={updating}
              >
                <FiCheckCircle className="mr-2" />
                Mark as Completed
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Session Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaEgg className="text-xl text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{session.number_of_eggs}</p>
                <p className="text-sm text-gray-600">Eggs</p>
              </div>
            </Card>

            <Card className="text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiCalendar className="text-xl text-green-600" />
                </div>
                <p className="text-2xl font-bold">{session.expected_hatch_days}</p>
                <p className="text-sm text-gray-600">Total Days</p>
              </div>
            </Card>

            <Card className="text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiClock className="text-xl text-purple-600" />
                </div>
                <p className="text-2xl font-bold">{session.days_elapsed}</p>
                <p className="text-sm text-gray-600">Days Elapsed</p>
              </div>
            </Card>

            <Card className="text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiClock className="text-xl text-yellow-600" />
                </div>
                <p className="text-2xl font-bold">{session.days_remaining}</p>
                <p className="text-sm text-gray-600">Days Remaining</p>
              </div>
            </Card>
          </div>

          {/* Progress */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Progress Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Incubation Progress</span>
                  <span>{session.progress_percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      session.status === 'completed' ? 'bg-blue-600' : 
                      session.status === 'stopped' ? 'bg-gray-400' : 'bg-green-600'
                    }`}
                    style={{ width: `${session.progress_percentage}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {format(new Date(session.start_time), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Hatch</p>
                  <p className="font-medium">
                    {format(
                      new Date(new Date(session.start_time).setDate(
                        new Date(session.start_time).getDate() + session.expected_hatch_days
                      )),
                      'MMM d, yyyy'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Readings */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Sensor Readings</h3>
              <span className="text-sm text-gray-500">Last 10 readings</span>
            </div>
            
            {recentReadings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Temperature
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Humidity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentReadings.map((reading) => (
                      <tr key={reading.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {format(new Date(reading.timestamp), 'HH:mm:ss')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiThermometer className="mr-2 text-gray-400" />
                            <span className={`font-medium ${
                              reading.temperature >= 37 && reading.temperature <= 38 
                                ? 'text-green-600' 
                                : 'text-yellow-600'
                            }`}>
                              {reading.temperature.toFixed(1)}°C
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiDroplet className="mr-2 text-gray-400" />
                            <span className={`font-medium ${
                              reading.humidity >= 50 && reading.humidity <= 60 
                                ? 'text-green-600' 
                                : 'text-yellow-600'
                            }`}>
                              {reading.humidity.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            reading.temperature >= 37 && reading.temperature <= 38 && 
                            reading.humidity >= 50 && reading.humidity <= 60
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reading.temperature >= 37 && reading.temperature <= 38 && 
                             reading.humidity >= 50 && reading.humidity <= 60
                              ? 'Optimal'
                              : 'Check Required'
                            }
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No sensor readings available for this session.
                <button
                  onClick={handleSimulateReading}
                  className="mt-4 block w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Generate Simulated Reading
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Current Reading & Actions */}
        <div className="space-y-6">
          {latestReading ? (
            <Card>
              <h3 className="text-lg font-semibold mb-4">Current Reading</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Temperature</span>
                    <span className={`font-bold text-xl ${
                      latestReading.temperature >= 37 && latestReading.temperature <= 38 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {latestReading.temperature.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        latestReading.temperature >= 37 && latestReading.temperature <= 38 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, (latestReading.temperature - 35) * 20))}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>35°C</span>
                    <span>Optimal: 37-38°C</span>
                    <span>40°C</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Humidity</span>
                    <span className={`font-bold text-xl ${
                      latestReading.humidity >= 50 && latestReading.humidity <= 60 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {latestReading.humidity.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        latestReading.humidity >= 50 && latestReading.humidity <= 60 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, (latestReading.humidity - 20) * 1.25))}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>20%</span>
                    <span>Optimal: 50-60%</span>
                    <span>80%</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Last Updated</p>
                  <p className="font-medium">
                    {format(new Date(latestReading.timestamp), 'MMM d, yyyy HH:mm:ss')}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Overall Status</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    latestReading.temperature >= 37 && latestReading.temperature <= 38 && 
                    latestReading.humidity >= 50 && latestReading.humidity <= 60
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {latestReading.temperature >= 37 && latestReading.temperature <= 38 && 
                     latestReading.humidity >= 50 && latestReading.humidity <= 60
                      ? '✅ Optimal Conditions'
                      : '⚠️ Requires Attention'
                    }
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <h3 className="text-lg font-semibold mb-4">Current Reading</h3>
              <div className="text-center py-8 text-gray-500">
                No sensor readings available.
                <button
                  onClick={handleSimulateReading}
                  className="mt-4 block w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Generate Simulated Reading
                </button>
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={() => router.push(`/charts?session=${sessionId}`)}
                variant="secondary"
                className="w-full justify-center"
              >
                <FiBarChart2 className="mr-2" />
                View Charts
              </Button>
              
              <Button
                onClick={handleSimulateReading}
                isLoading={simulating}
                variant="secondary"
                className="w-full justify-center"
              >
                <FiRefreshCw className="mr-2" />
                Simulate Reading
              </Button>
              
              {session.status === 'running' && (
                <>
                  <Button
                    onClick={() => handleUpdateStatus('stopped')}
                    isLoading={updating}
                    variant="danger"
                    className="w-full justify-center"
                  >
                    <FiStopCircle className="mr-2" />
                    Stop Session
                  </Button>
                  
                  <Button
                    onClick={() => handleUpdateStatus('completed')}
                    isLoading={updating}
                    variant="primary"
                    className="w-full justify-center"
                  >
                    <FiCheckCircle className="mr-2" />
                    Mark as Completed
                  </Button>
                </>
              )}
              
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                className="w-full justify-center"
              >
                <FiTrash2 className="mr-2" />
                Delete Session
              </Button>
            </div>
          </Card>

          {/* Session Metadata */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Session Metadata</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Session ID</p>
                <p className="font-mono text-sm truncate">{session.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">
                  {format(new Date(session.created_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">
                  {format(new Date(session.updated_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteSessionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        sessionId={session.id}
        sessionName={`#${session.id.slice(-6)}`}
        onSuccess={handleDeleteSession}
      />
    </div>
  );
}