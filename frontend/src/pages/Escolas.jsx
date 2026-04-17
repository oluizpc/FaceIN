import { useEffect, useState } from 'react'
import { listarEscolas, criarEscola, desativarEscola } from '../api/escolas'

const vazio = { nome: '', cnpj: '', endereco: '', telefone: '' }

export default function Escolas() {
  const [escolas, setEscolas]         = useState([])
  const [form, setForm]               = useState(vazio)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro]               = useState('')

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
    <div style={{ padding: '32px 28px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '24px', margin: 0, letterSpacing: '-0.5px',
          }}>
            Escolas
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '5px 0 0' }}>
            {escolas.length} escola{escolas.length !== 1 ? 's' : ''} cadastrada{escolas.length !== 1 ? 's' : ''}
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
          {mostrarForm ? 'Cancelar' : '+ Nova escola'}
        </button>
      </div>

      {/* Form */}
      {mostrarForm && (
        <div className="fade-up" style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border-bright)',
          borderRadius: '12px',
          padding:      '26px',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontSize: '15px',
            fontWeight: 600, margin: '0 0 20px', color: 'var(--text-primary)',
          }}>
            Cadastrar escola
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
              {[
                ['nome',     'Nome',     true ],
                ['telefone', 'Telefone', false],
                ['cnpj',     'CNPJ',     false],
                ['endereco', 'Endereço', false],
              ].map(([k, label, req]) => (
                <div key={k}>
                  <label style={{
                    display: 'block', fontSize: '12px',
                    color: 'var(--text-secondary)', marginBottom: '7px', fontWeight: 500,
                  }}>
                    {label}{req ? ' *' : ''}
                  </label>
                  <input
                    className="fi-input"
                    value={form[k]}
                    onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    required={req}
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

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '16px' }}>
        {escolas.length === 0 && (
          <div style={{
            gridColumn: '1 / -1', textAlign: 'center',
            padding: '72px 0', color: 'var(--text-muted)', fontSize: '14px',
          }}>
            Nenhuma escola cadastrada.
          </div>
        )}
        {escolas.map(e => (
          <div
            key={e.id}
            className="fade-up"
            style={{
              background:   'var(--bg-surface)',
              border:       '1px solid var(--border)',
              borderRadius: '12px',
              padding:      '22px',
              position:     'relative',
              overflow:     'hidden',
              transition:   'border-color 0.2s, transform 0.2s',
              cursor:       'default',
            }}
            onMouseEnter={ev => {
              ev.currentTarget.style.borderColor = 'var(--border-bright)'
              ev.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={ev => {
              ev.currentTarget.style.borderColor = 'var(--border)'
              ev.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* Top accent line */}
            <div style={{
              position:   'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: 'linear-gradient(90deg, var(--accent) 0%, transparent 70%)',
            }} />

            {/* Icon */}
            <div style={{
              width:          '42px', height: '42px',
              background:     'rgba(0, 200, 240, 0.07)',
              border:         '1px solid rgba(0, 200, 240, 0.14)',
              borderRadius:   '10px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              marginBottom:   '14px',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 21h18" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M12 3L3 9h18L12 3z" stroke="var(--accent)" strokeWidth="1.6" strokeLinejoin="round"/>
                <rect x="9" y="13" width="6" height="8" rx="1" stroke="var(--accent)" strokeWidth="1.6"/>
              </svg>
            </div>

            <div style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 600,
              fontSize: '16px', marginBottom: '6px', color: 'var(--text-primary)',
            }}>
              {e.nome}
            </div>
            <div style={{
              fontSize: '12px', color: 'var(--text-muted)',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: '18px', lineHeight: 1.6,
            }}>
              {[e.cnpj, e.telefone, e.endereco].filter(Boolean).join(' · ') || 'Sem informações adicionais'}
            </div>

            <button
              onClick={() => remover(e.id)}
              style={{
                background:   'transparent',
                color:        'var(--text-muted)',
                border:       '1px solid var(--border)',
                padding:      '6px',
                borderRadius: '7px',
                fontSize:     '12px',
                cursor:       'pointer',
                width:        '100%',
                transition:   'all 0.2s',
              }}
              onMouseEnter={ev => { ev.currentTarget.style.borderColor = 'rgba(244,63,94,0.4)'; ev.currentTarget.style.color = 'var(--danger)'; }}
              onMouseLeave={ev => { ev.currentTarget.style.borderColor = 'var(--border)'; ev.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              Desativar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
