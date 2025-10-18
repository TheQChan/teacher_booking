import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { SessionList } from '../components/sessions/SessionList'
import { CreateSessionForm } from '../components/sessions/CreateSessionForm'
import { sessionApi } from '../lib/api'
import { Plus, Calendar } from 'lucide-react'
import { Button } from '../components/ui/Button'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  const handleCreateSession = async (data: { start_time: string; end_time: string }) => {
    try {
      setIsCreatingSession(true)
      await sessionApi.createSession({
        start_time: data.start_time,
        end_time: data.end_time,
        student: null,
        teacher: user!.id,
        status: 'available'
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating session:', error)
    } finally {
      setIsCreatingSession(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Панель управления
              </h1>
              <p className="text-gray-600 mt-1">
                {user.role === 'teacher' 
                  ? 'Управляйте своими занятиями и расписанием'
                  : 'Просматривайте доступные занятия и записывайтесь на них'
                }
              </p>
            </div>
            
            {user.role === 'teacher' && (
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showCreateForm ? 'Скрыть форму' : 'Создать занятие'}
              </Button>
            )}
          </div>
        </div>

        {user.role === 'teacher' && showCreateForm && (
          <div className="mb-8">
            <CreateSessionForm
              onSubmit={handleCreateSession}
              isLoading={isCreatingSession}
            />
          </div>
        )}

        <SessionList
          onCreateSession={handleCreateSession}
          isCreatingSession={isCreatingSession}
        />
      </div>
    </div>
  )
}
