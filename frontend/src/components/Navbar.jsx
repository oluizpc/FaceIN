import { NavLink } from 'react-router-dom'

const links = [
  { to: '/alunos',  label: 'Alunos' },
  { to: '/painel',  label: 'Painel' },
]

export default function Navbar() {
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
    </nav>
  )
}
