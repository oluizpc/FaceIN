import { useEffect, useState } from 'react'
import { listarUsuarios, registrar, desativarUsuario } from '../api/auth'
import { listarEscolas } from '../api/escolas'

const vazio = { nome: '', email: '', senha: '', role: 'operador', escola_id: '' }

const ROLE_CONFIG = {
  admin:    { label: 'Admin',    bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: 'rgba(167,139,250,0.25)' },
  operador: { label: 'Operador', bg: 'rgba(0,200,240,0.07)',  color: 'var(--accent)', border: 'rgba(0,200,240,0.2)' },
}

export default function Usuarios() {
  const [usuarios, setUsuarios]       = useState([])
  const [escolas, setEscolas]         = useState([])
  const [form, setForm]               = useState(vazio)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro]               = useState('')

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

  const escolaNome = (escola_id) => escolas.find(e => e.id === escola_id)?.nome || '—'

  return (
    <div style={{ padding: '32px 28px', maxWidth: '920px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '24px', margin: 0, letterSpacing: '-0.5px',
          }}>
            Usuários
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '5px 0 0' }}>
            {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} cadastrado{usuarios.length !== 1 ? 's' : ''}
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
          {mostrarForm ? 'Cancelar' : '+ Novo usuário'}
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
            Cadastrar usuário
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
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '7px', fontWeight: 500 }}>Nome *</label>
                <input className="fi-input" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '7px', fontWeight: 500 }}>E-mail *</label>
                <input type="email" className="fi-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '7px', fontWeight: 500 }}>Senha *</label>
                <input type="password" className="fi-input" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '7px', fontWeight: 500 }}>Perfil *</label>
                <select
                  className="fi-input"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value, escola_id: '' }))}
                >
                  <option value="operador">Operador</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {form.role === 'operador' && (
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
              )}
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
        background:   'var(--bg-surface)',
        border:       '1px solid var(--border)',
        borderRadius: '12px',
        overflow:     'hidden',
      }}>
        {usuarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
            Nenhum usuário cadastrado.
          </div>
        ) : (
          usuarios.map((u, i) => {
            const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.operador
            return (
              <div
                key={u.id}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent:'space-between',
                  padding:      '15px 22px',
                  borderBottom: i < usuarios.length - 1 ? '1px solid var(--border)' : 'none',
                  transition:   'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width:          '36px', height: '36px',
                    background:     rc.bg,
                    border:         `1px solid ${rc.border}`,
                    borderRadius:   '50%',
                    display:        'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize:       '13px', fontWeight: 700, color: rc.color,
                    flexShrink:     0,
                  }}>
                    {u.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{u.nome}</span>
                      <span style={{
                        background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                        padding: '2px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                      }}>
                        {rc.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
                      {u.email}
                      {u.escola_id && (
                        <span style={{ color: 'var(--accent)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, marginLeft: '8px' }}>
                          · {escolaNome(u.escola_id)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => remover(u.id)}
                  style={{
                    background: 'transparent', color: 'var(--text-muted)',
                    border: '1px solid var(--border)', padding: '6px 14px',
                    borderRadius: '7px', fontSize: '12px', cursor: 'pointer',
                    transition: 'all 0.2s', flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(244,63,94,0.4)'; e.currentTarget.style.color = 'var(--danger)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  Desativar
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
