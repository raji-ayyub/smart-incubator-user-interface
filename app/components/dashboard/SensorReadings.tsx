'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { readingAPI, sessionAPI } from '@/app/api/client';
import { Reading, Session } from '@/lib/types';
import { format } from 'date-fns';
import { FiThermometer, FiDroplet, FiRefreshCw } from 'react-icons/fi';

export function SensorReadings() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchCurrentData();
    const interval = setInterval(fetchCurrentData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentData = async () => {
    try {
      // Get current running session
      const sessionsResponse = await sessionAPI.list({ status: 'running', limit: 1 });
      if (sessionsResponse.data.length > 0) {
        const session = sessionsResponse.data[0];
        setCurrentSession(session);
        
        // Get latest reading for this session
        const readingsResponse = await readingAPI.getLatest(session.id);
        setLatestReading(readingsResponse.data);
      } else {
        setCurrentSession(null);
        setLatestReading(null);
      }
    } catch (error) {
      console.error('Failed to fetch sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateReading = async () => {
    if (!currentSession) return;
    
    setSimulating(true);
    try {
      await readingAPI.simulate(currentSession.id);
      await fetchCurrentData(); // Refresh data
    } catch (error) {
      console.error('Failed to simulate reading:', error);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="p-8 text-center">Loading sensor data...</div>
      </Card>
    );
  }

  if (!currentSession || !latestReading) {
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-4">Sensor Readings</h3>
        <p className="text-gray-500">No active session. Start a session to see sensor data.</p>
      </Card>
    );
  }

  const getTemperatureColor = (temp: number) => {
    if (temp < 36.5) return 'text-blue-600';
    if (temp > 38.5) return 'text-red-600';
    return 'text-green-600';
  };

  const getHumidityColor = (humidity: number) => {
    if (humidity < 45) return 'text-yellow-600';
    if (humidity > 65) return 'text-red-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Current Sensor Readings</h3>
        <button
          onClick={handleSimulateReading}
          disabled={simulating}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors"
        >
          <FiRefreshCw className={simulating ? 'animate-spin' : ''} />
          {simulating ? 'Simulating...' : 'Simulate Reading'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature Card */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <FiThermometer className="text-2xl text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Temperature</p>
              <p className={`text-2xl font-bold ${getTemperatureColor(latestReading.temperature)}`}>
                {latestReading.temperature.toFixed(1)}°C
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Optimal Range</span>
              <span className="font-medium">37.0°C - 38.0°C</span>
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
          </div>
        </div>

        {/* Humidity Card */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FiDroplet className="text-2xl text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Humidity</p>
              <p className={`text-2xl font-bold ${getHumidityColor(latestReading.humidity)}`}>
                {latestReading.humidity.toFixed(1)}%
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Optimal Range</span>
              <span className="font-medium">50% - 60%</span>
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
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Last updated: {format(new Date(latestReading.timestamp), 'HH:mm:ss')}</span>
          <span>Auto-refresh every 5s</span>
        </div>
      </div>
    </Card>
  );
}