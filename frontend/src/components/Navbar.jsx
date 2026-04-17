import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const { theme, toggle }   = useTheme()
  const navigate = useNavigate()

  const links = [
    { to: '/escolas',  label: 'Escolas'  },
    { to: '/alunos',   label: 'Alunos'   },
    { to: '/painel',   label: 'Painel'   },
    ...(usuario?.role === 'admin' ? [{ to: '/usuarios', label: 'Usuários' }] : []),
  ]

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav style={{
      background:   'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      padding:      '0 28px',
      height:       '58px',
      display:      'flex',
      alignItems:   'center',
      gap:          '36px',
      position:     'sticky',
      top:          0,
      zIndex:       100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '4px', flexShrink: 0 }}>
        <div style={{
          width: '30px', height: '30px',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
          borderRadius: '7px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8.5" r="3.2" stroke="#000" strokeWidth="1.8"/>
            <path d="M4.5 20.5c0-3.5 3.4-6.5 7.5-6.5s7.5 3 7.5 6.5" stroke="#000" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M2 5V3.5A1.5 1.5 0 013.5 2H5" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M2 19v1.5A1.5 1.5 0 003.5 22H5" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M22 5V3.5A1.5 1.5 0 0020.5 2H19" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M22 19v1.5A1.5 1.5 0 0120.5 22H19" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{
          fontFamily:    'Syne, sans-serif',
          fontWeight:    700,
          fontSize:      '17px',
          color:         'var(--text-primary)',
          letterSpacing: '-0.4px',
        }}>
          Face<span style={{ color: 'var(--accent)' }}>IN</span>
        </span>
      </div>

      {/* Links */}
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          style={({ isActive }) => ({
            fontSize:      '13.5px',
            fontWeight:    500,
            color:         isActive ? 'var(--accent)' : 'var(--text-secondary)',
            textDecoration:'none',
            transition:    'color 0.2s',
            paddingBottom: '2px',
            borderBottom:  isActive ? '1.5px solid var(--accent)' : '1.5px solid transparent',
            whiteSpace:    'nowrap',
          })}
        >
          {l.label}
        </NavLink>
      ))}

      {/* User area */}
      {usuario && (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px',
              background: 'var(--accent-glow)',
              border:      '1px solid rgba(0, 200, 240, 0.25)',
              borderRadius:'50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: 'var(--accent)',
              flexShrink: 0,
            }}>
              {usuario.nome?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              {usuario.nome}
            </span>
            {usuario.role === 'admin' && (
              <span style={{
                background:   'rgba(167, 139, 250, 0.12)',
                color:        '#a78bfa',
                border:       '1px solid rgba(167, 139, 250, 0.25)',
                padding:      '2px 8px',
                borderRadius: '999px',
                fontSize:     '11px',
                fontWeight:   600,
              }}>
                admin
              </span>
            )}
          </div>
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            style={{
              background:   'transparent',
              border:       '1px solid var(--border-bright)',
              color:        'var(--text-secondary)',
              width:        '32px', height: '32px',
              borderRadius: '7px',
              display:      'flex', alignItems: 'center', justifyContent: 'center',
              cursor:       'pointer',
              transition:   'all 0.2s',
              flexShrink:   0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <button
            onClick={handleLogout}
            style={{
              background:   'transparent',
              border:       '1px solid var(--border-bright)',
              color:        'var(--text-muted)',
              padding:      '5px 13px',
              borderRadius: '6px',
              fontSize:     '12px',
              cursor:       'pointer',
              transition:   'all 0.2s',
              flexShrink:   0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(244,63,94,0.4)'
              e.currentTarget.style.color = 'var(--danger)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-bright)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            Sair
          </button>
        </div>
      )}
    </nav>
  )
}
