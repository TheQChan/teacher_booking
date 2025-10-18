import axios from 'axios'
import { User, Session, RegisterData } from '../types'

const API_BASE = '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

// Auth endpoints
export const authApi = {
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post('/register/', data)
    return response.data.user
  },
  
  login: async (username: string, password: string): Promise<User> => {
    const response = await api.post('/drf-auth/login/', {
      username,
      password,
    })
    // DRF session auth returns user data in response
    return response.data
  },
  
  logout: async (): Promise<void> => {
    await api.post('/drf-auth/logout/')
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/drf-auth/user/')
    return response.data
  }
}

// Session endpoints
export const sessionApi = {
  getSessions: async (): Promise<Session[]> => {
    const response = await api.get('/session/')
    return response.data
  },
  
  createSession: async (data: Omit<Session, 'id' | 'status'> & { status?: Session['status'] }): Promise<Session> => {
    const response = await api.post('/session/', data)
    return response.data
  },
  
  scheduleSession: async (sessionId: number): Promise<{ message: string }> => {
    const response = await api.post(`/session/${sessionId}/schedule/`)
    return response.data
  },
  
  freeSession: async (sessionId: number): Promise<{ message: string }> => {
    const response = await api.post(`/session/${sessionId}/free/`)
    return response.data
  },
  
  cancelSession: async (sessionId: number): Promise<{ message: string }> => {
    const response = await api.post(`/session/${sessionId}/cancel/`)
    return response.data
  },
  
  completeSession: async (sessionId: number): Promise<{ message: string }> => {
    const response = await api.post(`/session/${sessionId}/complete/`)
    return response.data
  }
}

export default api
