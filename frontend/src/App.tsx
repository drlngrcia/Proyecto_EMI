import { useState, useEffect } from 'react'
import './App.css'

interface HealthResponse {
  status: string
  message: string
  timestamp: string
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: HealthResponse) => {
        setHealth(data)
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudo conectar al backend')
        setLoading(false)
      })
  }, [])

  return (
    <div className="app-container">
      <div className="hero-glow" />

      <header className="app-header">
        <div className="logo-badge">EMI</div>
        <h1 className="app-title">Sistema de Inventario</h1>
        <p className="app-subtitle">
          Gestión de productos, ventas y control de stock
        </p>
      </header>

      <main className="app-main">
        <div className="status-card">
          <div className="status-card__icon">
            {loading ? '⏳' : error ? '❌' : '✅'}
          </div>
          <div className="status-card__content">
            <h2 className="status-card__title">Estado del Backend</h2>
            {loading && <p className="status-card__text muted">Verificando conexión...</p>}
            {error  && <p className="status-card__text error">{error}</p>}
            {health && (
              <>
                <p className="status-card__text success">{health.message}</p>
                <p className="status-card__meta">
                  {new Date(health.timestamp).toLocaleString('es-BO')}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="stack-grid">
          {[
            { label: 'Frontend', tech: 'React + Vite', color: '#61dafb', icon: '⚛️' },
            { label: 'Backend',  tech: 'Express + TypeScript', color: '#6c63ff', icon: '⚙️' },
            { label: 'Base de Datos', tech: 'PostgreSQL 16', color: '#00d4aa', icon: '🗄️' },
          ].map((item) => (
            <div key={item.label} className="stack-card" style={{ '--accent': item.color } as React.CSSProperties}>
              <span className="stack-card__icon">{item.icon}</span>
              <span className="stack-card__label">{item.label}</span>
              <span className="stack-card__tech">{item.tech}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
