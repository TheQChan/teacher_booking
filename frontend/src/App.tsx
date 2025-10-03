import React, { useEffect, useMemo, useState } from 'react'

type Session = {
  id: number
  start_time: string
  end_time: string
  student: number | null
  teacher: number
  status: 'available' | 'scheduled' | 'completed'
}

const apiBase = '/api/v1'

async function fetchSessions(): Promise<Session[]> {
  const res = await fetch(`${apiBase}/session/`)
  if (!res.ok) throw new Error('Failed to fetch sessions')
  return res.json()
}

async function createSession(payload: Omit<Session, 'id' | 'status'> & { status?: Session['status'] }): Promise<Session> {
  const res = await fetch(`${apiBase}/session/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to create session')
  }
  return res.json()
}

export function App(): JSX.Element {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [teacherId, setTeacherId] = useState('')

  useEffect(() => {
    let isMounted = true
    fetchSessions()
      .then(data => {
        if (isMounted) setSessions(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
    return () => { isMounted = false }
  }, [])

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [sessions])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const payload = {
        start_time: start,
        end_time: end,
        teacher: Number(teacherId),
        student: null,
        status: 'available' as const
      }
      const created = await createSession(payload)
      setSessions(prev => [...prev, created])
      setStart('')
      setEnd('')
      setTeacherId('')
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании занятия')
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' }}>
      <h1>Teacher Booking</h1>
      <p>Список занятий и создание новых слотов.</p>

      <section style={{ margin: '16px 0', padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Создать занятие</h2>
        <form onSubmit={onCreate} style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
          <label>
            <div>Начало (ISO, например 2025-10-03T10:00:00Z)</div>
            <input value={start} onChange={e => setStart(e.target.value)} placeholder="2025-10-03T10:00:00Z" />
          </label>
          <label>
            <div>Окончание (ISO)</div>
            <input value={end} onChange={e => setEnd(e.target.value)} placeholder="2025-10-03T11:00:00Z" />
          </label>
          <label>
            <div>ID преподавателя</div>
            <input value={teacherId} onChange={e => setTeacherId(e.target.value)} placeholder="1" />
          </label>
          <button type="submit">Создать</button>
        </form>
      </section>

      {isLoading && <div>Загрузка...</div>}
      {error && <div style={{ color: 'crimson' }}>Ошибка: {error}</div>}

      <section style={{ marginTop: 16 }}>
        <h2>Занятия</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 6 }}>ID</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 6 }}>Начало</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 6 }}>Окончание</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 6 }}>Преподаватель</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 6 }}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {sortedSessions.map(s => (
              <tr key={s.id}>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{s.id}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{s.start_time}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{s.end_time}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{s.teacher}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}


