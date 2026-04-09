import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { buscarAluno, cadastrarFace } from '../api/alunos'
import { listarPorAluno, criarResponsavel, deletarResponsavel } from '../api/responsaveis'

const respVazio = {
  nome: '', parentesco: '', telefone: '', email: '',
  notif_whatsapp: true, notif_email: false, aceite_lgpd: true,
}

const ANGULOS = ['FRENTE', 'ESQUERDA', 'DIREITA']

export default function AlunoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [aluno, setAluno]           = useState(null)
  const [responsaveis, setResponsaveis] = useState([])
  const [form, setForm]             = useState(respVazio)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro]             = useState('')

  // câmera
  const videoRef   = useRef(null)
  const [angulo, setAngulo]         = useState('FRENTE')
  const [capturando, setCapturando] = useState(false)
  const [msgFace, setMsgFace]       = useState('')
  const [cameraAtiva, setCameraAtiva] = useState(false)

  useEffect(() => {
    buscarAluno(id).then(r => setAluno(r.data))
    carregarResponsaveis()
  }, [id])

  async function carregarResponsaveis() {
    const { data } = await listarPorAluno(id)
    setResponsaveis(data)
  }

  async function salvarResponsavel(e) {
    e.preventDefault()
    setErro('')
    try {
      await criarResponsavel(id, form)
      setForm(respVazio)
      setMostrarForm(false)
      carregarResponsaveis()
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao cadastrar responsável')
    }
  }

  async function removerResponsavel(respId) {
    if (!confirm('Remover responsável?')) return
    try {
      await deletarResponsavel(respId)
      carregarResponsaveis()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao remover')
    }
  }

  // ── câmera ────────────────────────────────────────────────
  async function iniciarCamera() {
    setCameraAtiva(true)
    setMsgFace('')
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current.srcObject = stream
  }

  function pararCamera() {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop())
    setCameraAtiva(false)
  }

  async function capturar() {
    setCapturando(true)
    setMsgFace('')
    try {
      const canvas = document.createElement('canvas')
      canvas.width  = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0)

      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg'))
      const form = new FormData()
      form.append('file', blob, 'face.jpg')

      await cadastrarFace(id, form, angulo)
      setMsgFace(`✅ Face (${angulo}) cadastrada com sucesso!`)
    } catch (err) {
      setMsgFace('❌ ' + (err.response?.data?.detail || 'Erro ao cadastrar face'))
    } finally {
      setCapturando(false)
    }
  }

  if (!aluno) return <p className="p-6 text-gray-400">Carregando...</p>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* cabeçalho */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/alunos')} className="text-gray-400 hover:text-gray-600 text-sm">← Voltar</button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{aluno.nome}</h1>
          <p className="text-sm text-gray-400">{aluno.turma} · {aluno.matricula}</p>
        </div>
      </div>

      {/* captura de face */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Cadastro de Face</h2>
        <div className="flex gap-3">
          {ANGULOS.map(a => (
            <button
              key={a}
              onClick={() => setAngulo(a)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${angulo === a ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-500 border-gray-300 hover:border-indigo-400'}`}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="relative bg-gray-900 rounded-lg overflow-hidden w-full max-w-sm aspect-video flex items-center justify-center">
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          {!cameraAtiva && <span className="absolute text-gray-400 text-sm">Câmera desligada</span>}
        </div>
        <div className="flex gap-3">
          {!cameraAtiva
            ? <button onClick={iniciarCamera} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Ligar câmera</button>
            : <>
                <button onClick={capturar} disabled={capturando} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                  {capturando ? 'Capturando...' : 'Capturar'}
                </button>
                <button onClick={pararCamera} className="text-sm text-gray-500 hover:text-gray-700">Desligar</button>
              </>
          }
        </div>
        {msgFace && <p className="text-sm">{msgFace}</p>}
      </section>

      {/* responsáveis */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Responsáveis</h2>
          <button onClick={() => setMostrarForm(v => !v)} className="text-sm text-indigo-600 hover:underline">+ Adicionar</button>
        </div>

        {mostrarForm && (
          <form onSubmit={salvarResponsavel} className="space-y-3 border border-gray-100 rounded-lg p-4">
            {erro && <p className="text-red-500 text-sm">{erro}</p>}
            <div className="grid grid-cols-2 gap-3">
              {[['nome','Nome'],['parentesco','Parentesco'],['telefone','Telefone'],['email','E-mail']].map(([k,label]) => (
                <div key={k}>
                  <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={form[k]}
                    onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-4 text-sm">
              {[['notif_whatsapp','WhatsApp'],['notif_email','E-mail'],['aceite_lgpd','LGPD']].map(([k,label]) => (
                <label key={k} className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} />
                  {label}
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Salvar</button>
              <button type="button" onClick={() => setMostrarForm(false)} className="text-sm text-gray-500">Cancelar</button>
            </div>
          </form>
        )}

        <div className="divide-y divide-gray-100">
          {responsaveis.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Nenhum responsável cadastrado.</p>}
          {responsaveis.map(r => (
            <div key={r.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-800">{r.nome} <span className="text-gray-400 font-normal">· {r.parentesco}</span></p>
                <p className="text-xs text-gray-400">{r.telefone} {r.email && `· ${r.email}`}</p>
                <div className="flex gap-2 mt-1">
                  {r.notif_whatsapp && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">WhatsApp</span>}
                  {r.aceite_lgpd    && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">LGPD ✓</span>}
                </div>
              </div>
              <button onClick={() => removerResponsavel(r.id)} className="text-xs text-red-400 hover:text-red-600">Remover</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
