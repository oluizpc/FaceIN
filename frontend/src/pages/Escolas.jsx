import { useEffect, useState } from 'react'
import { listarEscolas, criarEscola, desativarEscola } from '../api/escolas'

const vazio = { nome: '', cnpj: '', endereco: '', telefone: '' }

export default function Escolas() {
  const [escolas, setEscolas]             = useState([])
  const [form, setForm]                   = useState(vazio)
  const [mostrarForm, setMostrarForm]     = useState(false)
  const [erro, setErro]                   = useState('')

  async function carregar() {
    const { data } = await listarEscolas()
    setEscolas(data)
  }

  useEffect(() => { carregar() }, [])

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    try {
      await criarEscola(form)
      setForm(vazio)
      setMostrarForm(false)
      carregar()
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao cadastrar escola')
    }
  }

  async function remover(id) {
    if (!confirm('Desativar esta escola?')) return
    await desativarEscola(id)
    carregar()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Escolas</h1>
        <button
          onClick={() => setMostrarForm(v => !v)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Nova escola
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={salvar} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Cadastrar escola</h2>
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
              <label className="text-xs text-gray-500 mb-1 block">Telefone</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.telefone}
                onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">CNPJ</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.cnpj}
                onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Endereço</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.endereco}
                onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Salvar</button>
            <button type="button" onClick={() => setMostrarForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {escolas.length === 0 && (
          <p className="text-center text-gray-400 py-12 text-sm">Nenhuma escola cadastrada.</p>
        )}
        {escolas.map(e => (
          <div key={e.id} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="font-medium text-gray-800">{e.nome}</p>
              <p className="text-xs text-gray-400">
                {[e.cnpj, e.telefone, e.endereco].filter(Boolean).join(' · ') || 'Sem informações adicionais'}
              </p>
            </div>
            <button
              onClick={() => remover(e.id)}
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
