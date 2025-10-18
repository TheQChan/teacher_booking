import React, { useState, useEffect } from 'react'
import { Session } from '../../types'
import { SessionCard } from './SessionCard'
import { sessionApi } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { RefreshCw, Filter } from 'lucide-react'
import { Button } from '../ui/Button'
import { clsx } from 'clsx'

interface SessionListProps {
  onCreateSession?: (data: { start_time: string; end_time: string }) => void
  isCreatingSession?: boolean
}

export const SessionList: React.FC<SessionListProps> = ({
  onCreateSession,
  isCreatingSession = false
}) => {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const data = await sessionApi.getSessions()
      setSessions(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки занятий')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const handleSessionAction = async (sessionId: number, action: () => Promise<any>) => {
    try {
      setIsActionLoading(sessionId)
      await action()
      await loadSessions() // Reload sessions after action
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Ошибка выполнения действия')
    } finally {
      setIsActionLoading(null)
    }
  }

  const handleSchedule = (sessionId: number) => {
    handleSessionAction(sessionId, () => sessionApi.scheduleSession(sessionId))
  }

  const handleFree = (sessionId: number) => {
    handleSessionAction(sessionId, () => sessionApi.freeSession(sessionId))
  }

  const handleCancel = (sessionId: number) => {
    handleSessionAction(sessionId, () => sessionApi.cancelSession(sessionId))
  }

  const handleComplete = (sessionId: number) => {
    handleSessionAction(sessionId, () => sessionApi.completeSession(sessionId))
  }

  const filteredSessions = sessions.filter(session => {
    if (statusFilter === 'all') return true
    return session.status === statusFilter
  })

  const sortedSessions = filteredSessions.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Войдите в систему для просмотра занятий</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Занятия
          </h2>
          <p className="text-gray-600">
            Добро пожаловать, {user.first_name} {user.last_name} ({user.role === 'teacher' ? 'Преподаватель' : 'Ученик'})
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadSessions}
            isLoading={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          Все
        </Button>
        <Button
          variant={statusFilter === 'available' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('available')}
        >
          Свободные
        </Button>
        <Button
          variant={statusFilter === 'scheduled' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('scheduled')}
        >
          Забронированные
        </Button>
        <Button
          variant={statusFilter === 'completed' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('completed')}
        >
          Завершенные
        </Button>
        <Button
          variant={statusFilter === 'canceled' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('canceled')}
        >
          Отмененные
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500 mt-2">Загрузка занятий...</p>
        </div>
      ) : sortedSessions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Занятия не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              currentUserId={user.id}
              userRole={user.role}
              onSchedule={handleSchedule}
              onFree={handleFree}
              onCancel={handleCancel}
              onComplete={handleComplete}
              isLoading={isActionLoading === session.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
