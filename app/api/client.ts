import axios from 'axios';
import { Session, Reading, CreateSessionRequest, CreateReadingRequest } from '@/lib/types';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = "https://smart-incubator-monitoring-platform.onrender.com"
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Sessions API
export const sessionAPI = {
  create: (data: CreateSessionRequest): Promise<{ data: Session }> => 
    apiClient.post('/sessions/', data),
  list: (params?: any): Promise<{ data: Session[] }> => 
    apiClient.get('/sessions/', { params }),
  get: (id: string): Promise<{ data: Session }> => 
    apiClient.get(`/sessions/${id}`),
  update: (id: string, data: any): Promise<{ data: Session }> => 
    apiClient.patch(`/sessions/${id}`, data),
  delete: (id: string): Promise<void> => 
    apiClient.delete(`/sessions/${id}`),
};

// Readings API
export const readingAPI = {
  create: (data: CreateReadingRequest): Promise<{ data: Reading }> => 
    apiClient.post('/readings/', data),
  getLatest: (sessionId: string): Promise<{ data: Reading }> => 
    apiClient.get(`/readings/session/${sessionId}/latest`),
  getHistory: (sessionId: string, params?: any): Promise<{ data: Reading[] }> =>
    apiClient.get(`/readings/session/${sessionId}/history`, { params }),
  simulate: (sessionId: string): Promise<{ data: Reading }> =>
    apiClient.post(`/readings/simulate/${sessionId}`),
  
};


