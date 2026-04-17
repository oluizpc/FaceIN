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

  const [aluno, setAluno]                 = useState(null)
  const [responsaveis, setResponsaveis]   = useState([])
  const [form, setForm]                   = useState(respVazio)
  const [mostrarForm, setMostrarForm]     = useState(false)
  const [erro, setErro]                   = useState('')

  const videoRef                          = useRef(null)
  const [angulo, setAngulo]               = useState('FRENTE')
  const [capturando, setCapturando]       = useState(false)
  const [msgFace, setMsgFace]             = useState(null)
  const [cameraAtiva, setCameraAtiva]     = useState(false)

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

  async function iniciarCamera() {
    setCameraAtiva(true)
    setMsgFace(null)
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current.srcObject = stream
  }

  function pararCamera() {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop())
    setCameraAtiva(false)
  }

  async function capturar() {
    setCapturando(true)
    setMsgFace(null)
    try {
      const canvas = document.createElement('canvas')
      canvas.width  = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0)

      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg'))
      const form = new FormData()
      form.append('file', blob, 'face.jpg')

      await cadastrarFace(id, form, angulo)
      setMsgFace({ ok: true, text: `Face (${angulo}) cadastrada com sucesso` })
    } catch (err) {
      setMsgFace({ ok: false, text: err.response?.data?.detail || 'Erro ao cadastrar face' })
    } finally {
      setCapturando(false)
    }
  }

  if (!aluno) return (
    <div style={{ padding: '40px 28px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
      Carregando...
    </div>
  )

  return (
    <div className="fade-up" style={{ padding: '32px 28px', maxWidth: '940px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/alunos')}
          style={{
            background:   'transparent',
            border:       '1px solid var(--border-bright)',
            color:        'var(--text-secondary)',
            padding:      '7px 14px',
            borderRadius: '7px',
            fontSize:     '12px',
            cursor:       'pointer',
            transition:   'all 0.2s',
            display:      'flex', alignItems: 'center', gap: '6px',
            flexShrink:   0,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          ← Voltar
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '22px', margin: 0, letterSpacing: '-0.4px',
          }}>
            {aluno.nome}
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
            {aluno.turma} · {aluno.matricula}
            {aluno.escola?.nome && <span style={{ color: 'var(--accent)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, marginLeft: '6px' }}>· {aluno.escola.nome}</span>}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Face capture */}
        <section style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border)',
          borderRadius: '12px',
          padding:      '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="8.5" r="3" stroke="var(--accent)" strokeWidth="1.6"/>
              <path d="M2 5V3.5A1.5 1.5 0 013.5 2H5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M22 5V3.5A1.5 1.5 0 0020.5 2H19" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M2 19v1.5A1.5 1.5 0 003.5 22H5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M22 19v1.5A1.5 1.5 0 0120.5 22H19" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6 18c0-3 2.7-5 6-5s6 2 6 5" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <h2 style={{
              fontFamily: 'Syne, sans-serif', fontSize: '14px',
              fontWeight: 600, margin: 0, color: 'var(--text-primary)',
            }}>
              Cadastro de Face
            </h2>
          </div>

          {/* Angle selector */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
            {ANGULOS.map(a => (
              <button
                key={a}
                onClick={() => setAngulo(a)}
                style={{
                  flex:         1,
                  padding:      '7px 0',
                  borderRadius: '7px',
                  fontSize:     '11px',
                  fontWeight:   600,
                  fontFamily:   'Syne, sans-serif',
                  cursor:       'pointer',
                  transition:   'all 0.2s',
                  background:   angulo === a ? 'var(--accent)' : 'transparent',
                  color:        angulo === a ? '#000' : 'var(--text-muted)',
                  border:       angulo === a ? '1px solid var(--accent)' : '1px solid var(--border-bright)',
                }}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Camera */}
          <div
            className={cameraAtiva ? 'camera-active-border' : ''}
            style={{
              position:     'relative',
              background:   '#020406',
              borderRadius: '9px',
              overflow:     'hidden',
              aspectRatio:  '4/3',
              display:      'flex', alignItems: 'center', justifyContent: 'center',
              border:       cameraAtiva ? '1px solid var(--accent)' : '1px solid var(--border)',
              marginBottom: '12px',
            }}
          >
            <video ref={videoRef} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {!cameraAtiva && (
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ display: 'block', margin: '0 auto 8px', opacity: 0.2 }}>
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="var(--text-primary)" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" stroke="var(--text-primary)" strokeWidth="1.5"/>
                </svg>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Câmera desligada</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {!cameraAtiva ? (
              <button
                onClick={iniciarCamera}
                style={{
                  flex: 1, background: 'var(--accent)', color: '#000', border: 'none',
                  padding: '9px', borderRadius: '8px', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                Ligar câmera
              </button>
            ) : (
              <>
                <button
                  onClick={capturar}
                  disabled={capturando}
                  style={{
                    flex:         1,
                    background:   capturando ? 'rgba(0, 229, 160, 0.15)' : 'rgba(0, 229, 160, 0.12)',
                    color:        'var(--success)',
                    border:       '1px solid rgba(0, 229, 160, 0.3)',
                    padding:      '9px',
                    borderRadius: '8px',
                    fontSize:     '13px',
                    fontWeight:   600,
                    cursor:       capturando ? 'not-allowed' : 'pointer',
                    transition:   'all 0.2s',
                  }}
                >
                  {capturando ? 'Capturando...' : 'Capturar'}
                </button>
                <button
                  onClick={pararCamera}
                  style={{
                    background: 'transparent', color: 'var(--text-muted)',
                    border: '1px solid var(--border-bright)', padding: '9px 16px',
                    borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  Desligar
                </button>
              </>
            )}
          </div>

          {msgFace && (
            <div style={{
              marginTop:    '10px',
              padding:      '9px 13px',
              borderRadius: '7px',
              fontSize:     '12.5px',
              background:   msgFace.ok ? 'rgba(0,229,160,0.08)' : 'rgba(244,63,94,0.08)',
              border:       msgFace.ok ? '1px solid rgba(0,229,160,0.25)' : '1px solid rgba(244,63,94,0.25)',
              color:        msgFace.ok ? 'var(--success)' : 'var(--danger)',
            }}>
              {msgFace.text}
            </div>
          )}
        </section>

        {/* Responsáveis */}
        <section style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border)',
          borderRadius: '12px',
          padding:      '24px',
          display:      'flex',
          flexDirection:'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="var(--accent)" strokeWidth="1.6"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontSize: '14px',
                fontWeight: 600, margin: 0, color: 'var(--text-primary)',
              }}>
                Responsáveis
              </h2>
            </div>
            <button
              onClick={() => setMostrarForm(v => !v)}
              style={{
                background:   mostrarForm ? 'transparent' : 'rgba(0,200,240,0.08)',
                color:        mostrarForm ? 'var(--text-muted)' : 'var(--accent)',
                border:       mostrarForm ? '1px solid var(--border-bright)' : '1px solid rgba(0,200,240,0.2)',
                padding:      '5px 13px',
                borderRadius: '7px',
                fontSize:     '12px',
                fontWeight:   600,
                cursor:       'pointer',
                transition:   'all 0.2s',
              }}
            >
              {mostrarForm ? 'Cancelar' : '+ Adicionar'}
            </button>
          </div>

          {mostrarForm && (
            <div className="fade-up" style={{
              background:   'var(--bg-elevated)',
              border:       '1px solid var(--border-bright)',
              borderRadius: '9px',
              padding:      '16px',
              marginBottom: '16px',
            }}>
              {erro && (
                <div style={{
                  background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)',
                  borderRadius: '7px', padding: '8px 12px', marginBottom: '14px',
                  fontSize: '12px', color: 'var(--danger)',
                }}>{erro}</div>
              )}
              <form onSubmit={salvarResponsavel}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  {[['nome','Nome'],['parentesco','Parentesco'],['telefone','Telefone'],['email','E-mail']].map(([k, label]) => (
                    <div key={k}>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 500 }}>{label}</label>
                      <input
                        className="fi-input"
                        style={{ padding: '8px 12px', fontSize: '13px' }}
                        value={form[k]}
                        onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
                  {[['notif_whatsapp', 'WhatsApp'], ['notif_email', 'E-mail'], ['aceite_lgpd', 'LGPD']].map(([k, label]) => (
                    <label key={k} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer',
                    }}>
                      <input
                        type="checkbox"
                        checked={form[k]}
                        onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))}
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <button type="submit" style={{
                  background: 'var(--accent)', color: '#000', border: 'none',
                  padding: '8px 20px', borderRadius: '7px',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}>
                  Salvar
                </button>
              </form>
            </div>
          )}

          <div style={{ flex: 1, overflow: 'auto' }}>
            {responsaveis.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                Nenhum responsável cadastrado.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {responsaveis.map(r => (
                  <div key={r.id} style={{
                    background:   'var(--bg-elevated)',
                    border:       '1px solid var(--border)',
                    borderRadius: '9px',
                    padding:      '12px 14px',
                    display:      'flex',
                    alignItems:   'flex-start',
                    justifyContent: 'space-between',
                    gap:          '10px',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                        {r.nome}
                        <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px' }}>{r.parentesco}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', fontFamily: 'JetBrains Mono, monospace' }}>
                        {[r.telefone, r.email].filter(Boolean).join(' · ')}
                      </div>
                      <div style={{ display: 'flex', gap: '5px', marginTop: '7px' }}>
                        {r.notif_whatsapp && (
                          <span style={{
                            background: 'rgba(0,229,160,0.08)', color: 'var(--success)',
                            border: '1px solid rgba(0,229,160,0.2)', padding: '2px 8px',
                            borderRadius: '999px', fontSize: '10px', fontWeight: 600,
                          }}>WhatsApp</span>
                        )}
                        {r.aceite_lgpd && (
                          <span style={{
                            background: 'rgba(0,200,240,0.07)', color: 'var(--accent)',
                            border: '1px solid rgba(0,200,240,0.18)', padding: '2px 8px',
                            borderRadius: '999px', fontSize: '10px', fontWeight: 600,
                          }}>LGPD</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removerResponsavel(r.id)}
                      style={{
                        background: 'transparent', color: 'var(--text-muted)',
                        border: '1px solid var(--border)', padding: '4px 10px',
                        borderRadius: '6px', fontSize: '11px', cursor: 'pointer',
                        flexShrink: 0, transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(244,63,94,0.35)'; e.currentTarget.style.color = 'var(--danger)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
