import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import { Eye, EyeOff } from 'lucide-react'
import { RegisterData } from '../../types'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth()
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    phone_number: '',
    role: 'student',
    first_name: '',
    last_name: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await register(formData)
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors || err.response?.data?.message || 'Ошибка регистрации'
      setError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Имя"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            placeholder="Имя"
          />
          <Input
            label="Фамилия"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            placeholder="Фамилия"
          />
        </div>
        
        <Input
          label="Имя пользователя"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          placeholder="Введите имя пользователя"
        />
        
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Введите email"
        />
        
        <Input
          label="Телефон"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          required
          placeholder="+7 (999) 123-45-67"
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Роль
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="student">Ученик</option>
            <option value="teacher">Преподаватель</option>
          </select>
        </div>
        
        <div className="relative">
          <Input
            label="Пароль"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Введите пароль"
            helperText="Минимум 8 символов"
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        <div className="relative">
          <Input
            label="Подтверждение пароля"
            name="password_confirm"
            type={showPasswordConfirm ? 'text' : 'password'}
            value={formData.password_confirm}
            onChange={handleChange}
            required
            placeholder="Подтвердите пароль"
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
          >
            {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Зарегистрироваться
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Войти
          </button>
        </p>
      </div>
    </Card>
  )
}
