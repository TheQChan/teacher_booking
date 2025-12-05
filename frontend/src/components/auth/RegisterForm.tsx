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

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.first_name.trim()) {
      errors.push('Имя обязательно')
    }

    if (!formData.last_name.trim()) {
      errors.push('Фамилия обязательна')
    }

    if (!formData.username.trim()) {
      errors.push('Имя пользователя обязательно')
    } else if (formData.username.length < 3) {
      errors.push('Имя пользователя должно содержать минимум 3 символа')
    }

    if (!formData.email.trim()) {
      errors.push('Email обязателен')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Некорректный формат email')
    }

    if (!formData.phone_number.trim()) {
      errors.push('Телефон обязателен')
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone_number)) {
      errors.push('Некорректный формат телефона')
    }

    if (!formData.password) {
      errors.push('Пароль обязателен')
    } else if (formData.password.length < 8) {
      errors.push('Пароль должен содержать минимум 8 символов')
    }

    if (formData.password !== formData.password_confirm) {
      errors.push('Пароли не совпадают')
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

  const roleOptions = [
    { value: 'student', label: 'Ученик' },
    { value: 'teacher', label: 'Преподаватель' }
  ]

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
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Р?Р?Р? Р?Р?Р?Р?Р?Р–Р?Р?Р?Р?Р??Р?Р?Р?</p>
          <div className="flex gap-2">
            {roleOptions.map(option => (
              <Button
                key={option.value}
                type="button"
                variant={formData.role === option.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() =>
                  setFormData(prev => ({
                    ...prev,
                    role: option.value as 'student' | 'teacher'
                  }))
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

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
