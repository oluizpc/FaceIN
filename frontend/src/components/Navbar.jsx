import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { usuario, logout } = useAuth()

  const links = [
    { to: '/escolas',   label: 'Escolas' },
    { to: '/alunos',    label: 'Alunos' },
    { to: '/painel',    label: 'Painel' },
    ...(usuario?.role === 'admin' ? [{ to: '/usuarios', label: 'Usuários' }] : []),
  ]
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-8">
      <span className="font-bold text-lg text-indigo-600 tracking-tight">FaceIn</span>
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`
          }
        >
          {l.label}
        </NavLink>
      ))}
      {usuario && (
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs text-gray-400">
            {usuario.nome}
            {usuario.role === 'admin' && (
              <span className="ml-1 bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded font-medium">admin</span>
            )}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Sair
          </button>
        </div>
      )}
    </nav>
  )
}
