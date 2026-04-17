import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarAlunos, criarAluno, desativarAluno } from '../api/alunos'
import { listarEscolas } from '../api/escolas'

const vazio = { nome: '', turma: '', matricula: '', escola_id: '' }

export default function Alunos() {
  const [alunos, setAlunos]           = useState([])
  const [escolas, setEscolas]         = useState([])
  const [form, setForm]               = useState(vazio)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro]               = useState('')
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
    <div style={{ padding: '32px 28px', maxWidth: '920px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '24px', margin: 0, letterSpacing: '-0.5px',
          }}>
            Alunos
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '5px 0 0' }}>
            {alunos.length} aluno{alunos.length !== 1 ? 's' : ''} cadastrado{alunos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setMostrarForm(v => !v)}
          style={{
            background:   mostrarForm ? 'transparent' : 'var(--accent)',
            color:        mostrarForm ? 'var(--text-secondary)' : '#000',
            border:       mostrarForm ? '1px solid var(--border-bright)' : 'none',
            padding:      '10px 22px',
            borderRadius: '8px',
            fontSize:     '14px',
            fontWeight:   600,
            cursor:       'pointer',
            transition:   'all 0.2s',
            flexShrink:   0,
          }}
        >
          {mostrarForm ? 'Cancelar' : '+ Novo aluno'}
        </button>
      </div>

      {/* Form */}
      {mostrarForm && (
        <div className="fade-up" style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border-bright)',
          borderRadius: '12px',
          padding:      '26px',
          marginBottom: '20px',
        }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontSize: '15px',
            fontWeight: 600, margin: '0 0 20px', color: 'var(--text-primary)',
          }}>
            Cadastrar aluno
          </h2>
          {erro && (
            <div style={{
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '18px',
              fontSize: '13px', color: 'var(--danger)',
            }}>{erro}</div>
          )}
          <form onSubmit={salvar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '7px', fontWeight: 500 }}>Escola *</label>
                <select
                  className="fi-input"
                  value={form.escola_id}
                  onChange={e => setForm(f => ({ ...f, escola_id: e.target.value }))}
                  required
                >
                  <option value="">Selecione uma escola...</option>
                  {escolas.map(es => <option key={es.id} value={es.id}>{es.nome}</option>)}
                </select>
              </div>
              {[['nome', 'Nome completo'], ['turma', 'Turma'], ['matricula', 'Matrícula']].map(([k, label]) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '7px', fontWeight: 500 }}>
                    {label} *
                  </label>
                  <input
                    className="fi-input"
                    value={form[k]}
                    onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    required
                  />
                </div>
              ))}
            </div>
            <button type="submit" style={{
              background: 'var(--accent)', color: '#000', border: 'none',
              padding: '10px 26px', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>
              Salvar
            </button>
          </form>
        </div>
      )}

      {/* List */}
      <div style={{
        background: 'var(--bg-surface)',
        border:     '1px solid var(--border)',
        borderRadius: '12px',
        overflow:   'hidden',
      }}>
        {alunos.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '72px 0',
            color: 'var(--text-muted)', fontSize: '14px',
          }}>
            Nenhum aluno cadastrado.
          </div>
        ) : (
          alunos.map((a, i) => (
            <div
              key={a.id}
              style={{
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'space-between',
                padding:      '15px 22px',
                borderBottom: i < alunos.length - 1 ? '1px solid var(--border)' : 'none',
                transition:   'background 0.15s',
                cursor:       'default',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width:          '36px', height: '36px',
                  background:     'rgba(0, 200, 240, 0.08)',
                  border:         '1px solid rgba(0, 200, 240, 0.18)',
                  borderRadius:   '50%',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       '14px', fontWeight: 700,
                  color:          'var(--accent)',
                  flexShrink:     0,
                }}>
                  {a.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{a.nome}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {a.escola?.nome && (
                      <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{a.escola.nome} · </span>
                    )}
                    <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{a.turma} · {a.matricula}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => navigate(`/alunos/${a.id}`)}
                  style={{
                    background:   'rgba(0, 200, 240, 0.07)',
                    color:        'var(--accent)',
                    border:       '1px solid rgba(0, 200, 240, 0.2)',
                    padding:      '6px 14px',
                    borderRadius: '7px',
                    fontSize:     '12px', fontWeight: 600,
                    cursor:       'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 200, 240, 0.14)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 200, 240, 0.07)'}
                >
                  Detalhes
                </button>
                <button
                  onClick={() => remover(a.id)}
                  style={{
                    background:   'transparent',
                    color:        'var(--text-muted)',
                    border:       '1px solid var(--border)',
                    padding:      '6px 14px',
                    borderRadius: '7px',
                    fontSize:     '12px',
                    cursor:       'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(244,63,94,0.4)'; e.currentTarget.style.color = 'var(--danger)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  Desativar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
