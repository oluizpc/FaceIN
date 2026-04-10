import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm]   = useState({ email: '', senha: '' })
  const [erro, setErro]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login }         = useAuth()
  const navigate          = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data } = await apiLogin(form)
      login(data.access_token, data.usuario)
      navigate('/escolas', { replace: true })
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-bold text-2xl text-indigo-600 tracking-tight">FaceIn</span>
          <p className="text-sm text-gray-400 mt-1">Controle de entrada escolar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {erro && (
            <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{erro}</p>
          )}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">E-mail</label>
            <input
              type="email"
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Senha</label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.senha}
              onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
