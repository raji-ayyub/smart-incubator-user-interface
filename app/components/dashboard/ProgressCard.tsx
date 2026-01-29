'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { sessionAPI } from '@/app/api/client';
import { Session } from '@/lib/types';
import { FiCalendar, FiClock, FiTrendingUp } from 'react-icons/fi';

export function ProgressCard() {
  const [stats, setStats] = useState({
    activeSessions: 0,
    totalEggs: 0,
    avgProgress: 0,
    daysUntilHatch: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await sessionAPI.list({ limit: 100 });
      const sessions = response.data;
      
      const activeSessions = sessions.filter((s: { status: string; }) => s.status === 'running');
      const totalEggs = activeSessions.reduce((sum: any, session:any) => sum + session.number_of_eggs, 0);
      const avgProgress = activeSessions.length > 0 
        ? activeSessions.reduce((sum: any, session: any) => sum + session.progress_percentage, 0) / activeSessions.length
        : 0;
      
      // Find nearest hatch date among active sessions
      const soonestHatch = activeSessions.length > 0
        ? Math.min(...activeSessions.map((s: { days_remaining: any; }) => s.days_remaining))
        : 0;

      setStats({
        activeSessions: activeSessions.length,
        totalEggs,
        avgProgress: Math.round(avgProgress),
        daysUntilHatch: soonestHatch,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card className="h-full">Loading...</Card>;
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-6">Progress Summary</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FiCalendar className="text-xl text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Sessions</p>
              <p className="text-2xl font-bold">{stats.activeSessions}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <FiTrendingUp className="text-xl text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Eggs</p>
              <p className="text-2xl font-bold">{stats.totalEggs}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FiClock className="text-xl text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Progress</p>
              <p className="text-2xl font-bold">{stats.avgProgress}%</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Days until next hatch:</span>
            <span className={`text-lg font-semibold ${
              stats.daysUntilHatch <= 3 ? 'text-green-600' : 'text-gray-700'
            }`}>
              {stats.daysUntilHatch} days
            </span>
          </div>
        </div>

        {stats.activeSessions === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800">
              No active sessions. Start a new incubation session to begin monitoring.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}