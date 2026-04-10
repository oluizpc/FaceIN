import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Escolas from './pages/Escolas'
import Alunos from './pages/Alunos'
import AlunoDetalhes from './pages/AlunoDetalhes'
import Painel from './pages/Painel'
import Usuarios from './pages/Usuarios'

function RotaProtegida({ children }) {
  const { autenticado } = useAuth()
  return autenticado ? children : <Navigate to="/login" replace />
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <RotaProtegida>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/escolas" replace />} />
                    <Route path="/escolas" element={<Escolas />} />
                    <Route path="/alunos" element={<Alunos />} />
                    <Route path="/alunos/:id" element={<AlunoDetalhes />} />
                    <Route path="/painel" element={<Painel />} />
                    <Route path="/usuarios" element={<Usuarios />} />
                  </Routes>
                </Layout>
              </RotaProtegida>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
