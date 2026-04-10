import { useEffect, useState } from 'react'
import { listarUsuarios, registrar, desativarUsuario } from '../api/auth'
import { listarEscolas } from '../api/escolas'

const vazio = { nome: '', email: '', senha: '', role: 'operador', escola_id: '' }

const ROLES = { admin: 'Admin', operador: 'Operador' }

export default function Usuarios() {
  const [usuarios, setUsuarios]           = useState([])
  const [escolas, setEscolas]             = useState([])
  const [form, setForm]                   = useState(vazio)
  const [mostrarForm, setMostrarForm]     = useState(false)
  const [erro, setErro]                   = useState('')

  async function carregar() {
    const [resU, resE] = await Promise.all([listarUsuarios(), listarEscolas()])
    setUsuarios(resU.data)
    setEscolas(resE.data)
  }

  useEffect(() => { carregar() }, [])

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    try {
      const payload = { ...form }
      if (payload.role === 'admin') delete payload.escola_id
      if (!payload.escola_id) delete payload.escola_id
      await registrar(payload)
      setForm(vazio)
      setMostrarForm(false)
      carregar()
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao cadastrar usuário')
    }
  }

  async function remover(id) {
    if (!confirm('Desativar este usuário?')) return
    await desativarUsuario(id)
    carregar()
  }

  const escolaNome = (escola_id) =>
    escolas.find(e => e.id === escola_id)?.nome || '—'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
        <button
          onClick={() => setMostrarForm(v => !v)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Novo usuário
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={salvar} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Cadastrar usuário</h2>
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nome *</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">E-mail *</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Senha *</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.senha}
                onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Perfil *</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value, escola_id: '' }))}
              >
                <option value="operador">Operador</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {form.role === 'operador' && (
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Escola *</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.escola_id}
                  onChange={e => setForm(f => ({ ...f, escola_id: e.target.value }))}
                  required
                >
                  <option value="">Selecione uma escola...</option>
                  {escolas.map(es => (
                    <option key={es.id} value={es.id}>{es.nome}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Salvar</button>
            <button type="button" onClick={() => setMostrarForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {usuarios.length === 0 && (
          <p className="text-center text-gray-400 py-12 text-sm">Nenhum usuário cadastrado.</p>
        )}
        {usuarios.map(u => (
          <div key={u.id} className="flex items-center justify-between px-6 py-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-800">{u.nome}</p>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  u.role === 'admin'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {ROLES[u.role]}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {u.email}
                {u.escola_id && <span className="ml-2 text-indigo-400">· {escolaNome(u.escola_id)}</span>}
              </p>
            </div>
            <button
              onClick={() => remover(u.id)}
              className="text-sm text-red-400 hover:text-red-600"
            >
              Desativar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
