import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarAlunos, criarAluno, desativarAluno } from '../api/alunos'
import { listarEscolas } from '../api/escolas'

const vazio = { nome: '', turma: '', matricula: '', escola_id: '' }

export default function Alunos() {
  const [alunos, setAlunos]               = useState([])
  const [escolas, setEscolas]             = useState([])
  const [form, setForm]                   = useState(vazio)
  const [mostrarForm, setMostrarForm]     = useState(false)
  const [erro, setErro]                   = useState('')
  const navigate = useNavigate()

  async function carregar() {
    const [resAlunos, resEscolas] = await Promise.all([listarAlunos(), listarEscolas()])
    setAlunos(resAlunos.data)
    setEscolas(resEscolas.data)
  }

  useEffect(() => { carregar() }, [])

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    try {
      await criarAluno(form)
      setForm(vazio)
      setMostrarForm(false)
      carregar()
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao cadastrar aluno')
    }
  }

  async function remover(id) {
    if (!confirm('Desativar este aluno?')) return
    await desativarAluno(id)
    carregar()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Alunos</h1>
        <button
          onClick={() => setMostrarForm(v => !v)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Novo aluno
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={salvar} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Cadastrar aluno</h2>
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <div className="grid grid-cols-2 gap-4">
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
            {[['nome', 'Nome completo'], ['turma', 'Turma'], ['matricula', 'Matrícula']].map(([k, label]) => (
              <div key={k}>
                <label className="text-xs text-gray-500 mb-1 block">{label} *</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form[k]}
                  onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  required
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Salvar</button>
            <button type="button" onClick={() => setMostrarForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {alunos.length === 0 && (
          <p className="text-center text-gray-400 py-12 text-sm">Nenhum aluno cadastrado.</p>
        )}
        {alunos.map(a => (
          <div key={a.id} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="font-medium text-gray-800">{a.nome}</p>
              <p className="text-xs text-gray-400">
                {a.escola?.nome && <span className="text-indigo-400 font-medium">{a.escola.nome} · </span>}
                {a.turma} · {a.matricula}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/alunos/${a.id}`)}
                className="text-sm text-indigo-600 hover:underline"
              >
                Detalhes
              </button>
              <button
                onClick={() => remover(a.id)}
                className="text-sm text-red-400 hover:text-red-600"
              >
                Desativar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
