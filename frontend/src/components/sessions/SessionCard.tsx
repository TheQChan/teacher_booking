import React from 'react'
import { Session } from '../../types'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

interface SessionCardProps {
  session: Session
  currentUserId: number
  userRole: 'student' | 'teacher'
  onSchedule?: (sessionId: number) => void
  onFree?: (sessionId: number) => void
  onCancel?: (sessionId: number) => void
  onComplete?: (sessionId: number) => void
  isLoading?: boolean
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  currentUserId,
  userRole,
  onSchedule,
  onFree,
  onCancel,
  onComplete,
  isLoading = false
}) => {
  const startTime = parseISO(session.start_time)
  const endTime = parseISO(session.end_time)
  
  const statusConfig = {
    available: {
      label: 'Свободно',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    },
    scheduled: {
      label: 'Забронировано',
      color: 'bg-blue-100 text-blue-800',
      icon: Calendar
    },
    completed: {
      label: 'Завершено',
      color: 'bg-gray-100 text-gray-800',
      icon: CheckCircle
    },
    canceled: {
      label: 'Отменено',
      color: 'bg-red-100 text-red-800',
      icon: XCircle
    }
  }

  const status = statusConfig[session.status]
  const StatusIcon = status.icon

  const canSchedule = userRole === 'student' && session.status === 'available'
  const canFree = userRole === 'student' && session.status === 'scheduled' && session.student === currentUserId
  const canCancel = userRole === 'teacher' && session.status === 'scheduled' && session.teacher === currentUserId
  const canComplete = userRole === 'teacher' && session.status === 'scheduled' && session.teacher === currentUserId

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Занятие #{session.id}
          </CardTitle>
          <span className={clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            status.color
          )}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </span>
        </div>
      </CardHeader>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {format(startTime, 'dd MMMM yyyy', { locale: ru })}
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {format(startTime, 'HH:mm', { locale: ru })} - {format(endTime, 'HH:mm', { locale: ru })}
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-2" />
          Преподаватель ID: {session.teacher}
          {session.student && (
            <span className="ml-4">
              Ученик ID: {session.student}
            </span>
          )}
        </div>

        {session.status === 'scheduled' && session.student === currentUserId && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Вы записаны на это занятие
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {canSchedule && (
            <Button
              size="sm"
              onClick={() => onSchedule?.(session.id)}
              isLoading={isLoading}
              className="flex-1"
            >
              Записаться
            </Button>
          )}
          
          {canFree && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onFree?.(session.id)}
              isLoading={isLoading}
              className="flex-1"
            >
              Отменить запись
            </Button>
          )}
          
          {canCancel && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onCancel?.(session.id)}
              isLoading={isLoading}
              className="flex-1"
            >
              Отменить занятие
            </Button>
          )}
          
          {canComplete && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onComplete?.(session.id)}
              isLoading={isLoading}
              className="flex-1"
            >
              Завершить
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
