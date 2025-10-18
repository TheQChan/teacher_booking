import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import { Calendar, Clock } from 'lucide-react'
import { format, addDays } from 'date-fns'

interface CreateSessionFormProps {
  onSubmit: (data: { start_time: string; end_time: string }) => void
  isLoading?: boolean
}

export const CreateSessionForm: React.FC<CreateSessionFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.start_time || !formData.end_time) {
      setError('Заполните все поля')
      return
    }

    const startTime = new Date(formData.start_time)
    const endTime = new Date(formData.end_time)

    if (endTime <= startTime) {
      setError('Время окончания должно быть позже времени начала')
      return
    }

    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const setQuickTime = (hours: number, duration: number) => {
    const tomorrow = addDays(new Date(), 1)
    const startTime = new Date(tomorrow)
    startTime.setHours(hours, 0, 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setHours(hours + duration, 0, 0, 0)

    setFormData({
      start_time: startTime.toISOString().slice(0, 16),
      end_time: endTime.toISOString().slice(0, 16)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Создать занятие
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Время начала"
            name="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={handleChange}
            required
          />
          <Input
            label="Время окончания"
            name="end_time"
            type="datetime-local"
            value={formData.end_time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Быстрый выбор:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickTime(9, 1)}
            >
              9:00-10:00
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickTime(10, 1)}
            >
              10:00-11:00
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickTime(14, 1)}
            >
              14:00-15:00
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickTime(15, 1)}
            >
              15:00-16:00
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          <Clock className="w-4 h-4 mr-2" />
          Создать занятие
        </Button>
      </form>
    </Card>
  )
}
