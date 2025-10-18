export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
  role: 'student' | 'teacher'
}

export interface Session {
  id: number
  start_time: string
  end_time: string
  student: number | null
  teacher: number
  status: 'available' | 'scheduled' | 'completed' | 'canceled'
}

export interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
}

export interface RegisterData {
  username: string
  email: string
  password: string
  password_confirm: string
  phone_number: string
  role: 'student' | 'teacher'
  first_name: string
  last_name: string
}

export interface LoginData {
  username: string
  password: string
}
