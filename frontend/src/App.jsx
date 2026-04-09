import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Alunos from './pages/Alunos'
import AlunoDetalhes from './pages/AlunoDetalhes'
import Painel from './pages/Painel'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/alunos" replace />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/alunos/:id" element={<AlunoDetalhes />} />
          <Route path="/painel" element={<Painel />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
