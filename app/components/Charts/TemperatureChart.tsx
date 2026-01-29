import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Reading } from '@/lib/types';
import { readingAPI } from '@/app/api/client';
import { format } from 'date-fns';

interface TemperatureChartProps {
  sessionId: string;
}

export function TemperatureChart({ sessionId }: TemperatureChartProps) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchReadings();
      const interval = setInterval(fetchReadings, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  const fetchReadings = async () => {
    try {
      const response = await readingAPI.getHistory(sessionId, { limit: 50 });
      setReadings(response.data);
    } catch (error) {
      console.error('Failed to fetch readings:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = readings.map(reading => ({
    time: format(new Date(reading.timestamp), 'HH:mm'),
    temperature: reading.temperature,
  }));

  return (
    <div className="h-80">
      <h3 className="text-lg font-semibold mb-4">Temperature Trend</h3>
      {loading ? (
        <div className="flex items-center justify-center h-full">Loading...</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis 
              domain={[36, 39]}
              label={{ value: '°C', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: any) => [`${value}°C`, 'Temperature']}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}