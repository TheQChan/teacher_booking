import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import { Eye, EyeOff } from 'lucide-react'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.username.trim()) {
      errors.push('Имя пользователя обязательно')
    }

    if (!formData.password) {
      errors.push('Пароль обязателен')
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '))
      setIsLoading(false)
      return
    }

    try {
      await login(formData.username, formData.password)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка входа. Проверьте данные.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Вход в систему</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <Input
          label="Имя пользователя"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          placeholder="Введите имя пользователя"
        />
        
        <div className="relative">
          <Input
            label="Пароль"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Введите пароль"
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Войти
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Нет аккаунта?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </Card>
  )
}
