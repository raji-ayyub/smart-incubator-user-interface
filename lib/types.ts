export interface Session {
  id: string;
  start_time: string;
  expected_hatch_days: number;
  number_of_eggs: number;
  status: 'running' | 'completed' | 'stopped';
  days_elapsed: number;
  days_remaining: number;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Reading {
  id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  session_id: string;
  created_at: string;
}

export interface CreateSessionRequest {
  expected_hatch_days: number;
  number_of_eggs: number;
  status?: 'running' | 'completed' | 'stopped';
}

export interface CreateReadingRequest {
  temperature: number;
  humidity: number;
  session_id: string;
}

export interface DeleteSession {
  temperature: number;
  humidity: number;
  session_id: string;
}