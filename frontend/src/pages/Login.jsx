import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm]       = useState({ email: '', senha: '' })
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data } = await apiLogin(form)
      login(data.access_token, data.usuario)
      navigate('/escolas', { replace: true })
    } catch (err) {
      setErro(err.response?.data?.detail || 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:       '100vh',
      background:      'var(--bg-base)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      position:        'relative',
      overflow:        'hidden',
    }}>
      {/* Dot grid background */}
      <div style={{
        position:        'absolute',
        inset:           0,
        backgroundImage: 'radial-gradient(circle, var(--border-bright) 1px, transparent 0)',
        backgroundSize:  '36px 36px',
        opacity:         0.5,
        pointerEvents:   'none',
      }} />

      {/* Central glow */}
      <div style={{
        position:   'absolute',
        top:        '35%', left: '50%',
        transform:  'translate(-50%, -50%)',
        width:      '700px', height: '700px',
        background: 'radial-gradient(circle, rgba(0, 200, 240, 0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div className="fade-up" style={{
        position:     'relative',
        zIndex:       10,
        background:   'var(--bg-surface)',
        border:       '1px solid var(--border-bright)',
        borderRadius: '18px',
        padding:      '48px 40px',
        width:        '100%',
        maxWidth:     '400px',
        boxShadow:    '0 32px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 200, 240, 0.04)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display:        'inline-flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          '58px', height: '58px',
            background:     'linear-gradient(135deg, rgba(0, 200, 240, 0.15) 0%, rgba(0, 112, 160, 0.1) 100%)',
            border:         '1px solid rgba(0, 200, 240, 0.25)',
            borderRadius:   '14px',
            marginBottom:   '18px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8.5" r="3.2" stroke="var(--accent)" strokeWidth="1.8"/>
              <path d="M4.5 20.5c0-3.5 3.4-6.5 7.5-6.5s7.5 3 7.5 6.5" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M2 5V3.5A1.5 1.5 0 013.5 2H5"   stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M2 19v1.5A1.5 1.5 0 003.5 22H5"  stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M22 5V3.5A1.5 1.5 0 0020.5 2H19" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M22 19v1.5A1.5 1.5 0 0120.5 22H19" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{
            fontFamily:    'Syne, sans-serif',
            fontWeight:    800,
            fontSize:      '30px',
            color:         'var(--text-primary)',
            letterSpacing: '-1px',
            lineHeight:    1,
          }}>
            Face<span style={{ color: 'var(--accent)' }}>IN</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Sistema de controle de acesso escolar
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {erro && (
            <div style={{
              background:   'rgba(244, 63, 94, 0.08)',
              border:       '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: '8px',
              padding:      '10px 14px',
              fontSize:     '13px',
              color:        'var(--danger)',
            }}>
              {erro}
            </div>
          )}

          <div>
            <label style={{
              display: 'block', fontSize: '12px',
              color: 'var(--text-secondary)', marginBottom: '7px', fontWeight: 500,
            }}>E-mail</label>
            <input
              type="email"
              autoComplete="email"
              className="fi-input"
              value={form.email}
              placeholder="seu@email.com"
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: '12px',
              color: 'var(--text-secondary)', marginBottom: '7px', fontWeight: 500,
            }}>Senha</label>
            <input
              type="password"
              autoComplete="current-password"
              className="fi-input"
              value={form.senha}
              placeholder="••••••••"
              onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop:    '6px',
              background:   loading ? 'var(--accent-dim)' : 'var(--accent)',
              color:        '#000',
              border:       'none',
              borderRadius: '9px',
              padding:      '13px',
              fontSize:     '14px',
              fontWeight:   700,
              fontFamily:   'Syne, sans-serif',
              cursor:       loading ? 'not-allowed' : 'pointer',
              transition:   'all 0.2s',
              letterSpacing:'0.4px',
            }}
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
