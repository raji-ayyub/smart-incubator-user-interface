import { useState, useEffect } from 'react';
import { Session } from '@/lib/types';
import { sessionAPI } from '@/app/api/client';
import { Card } from '../ui/Card';
import { format } from 'date-fns';

export function CurrentSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentSession();
    const interval = setInterval(fetchCurrentSession, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentSession = async () => {
    try {
      const response = await sessionAPI.list({ status: 'running', limit: 1 });
      if (response.data.length > 0) {
        setSession(response.data[0]);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card className="p-6">Loading...</Card>;
  }

  if (!session) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">No Active Session</h2>
        <p className="text-gray-600">Start a new incubation session to begin monitoring.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">Current Session</h2>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
          {session.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Start Time</p>
          <p className="font-medium">
            {format(new Date(session.start_time), 'MMM d, HH:mm')}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Eggs</p>
          <p className="font-medium">{session.number_of_eggs}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Days Elapsed</p>
          <p className="font-medium">{session.days_elapsed}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Days Remaining</p>
          <p className="font-medium">{session.days_remaining}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Progress</span>
          <span>{session.progress_percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${session.progress_percentage}%` }}
          ></div>
        </div>
      </div>
    </Card>
  );
}