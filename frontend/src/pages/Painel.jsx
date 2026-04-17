import { useEffect, useRef, useState, useCallback } from 'react'
import { identificarFrame } from '../api/reconhecimento'

const INTERVALO_MS = 2000

const STATUS_CONFIG = {
  inativo:     { label: 'Painel inativo',           color: 'var(--text-muted)',  dot: false },
  monitorando: { label: 'Monitorando...',            color: 'var(--accent)',      dot: true  },
  reconhecido: { label: 'Já entrou hoje',            color: 'var(--warning)',     dot: true  },
  entrada:     { label: 'Entrada registrada',        color: 'var(--success)',     dot: true  },
  erro:        { label: 'Erro ao processar frame',   color: 'var(--danger)',      dot: false },
}

export default function Painel() {
  const videoRef    = useRef(null)
  const intervalRef = useRef(null)

  const [ativo, setAtivo]                 = useState(false)
  const [identificados, setIdentificados] = useState([])
  const [entradas, setEntradas]           = useState([])
  const [status, setStatus]               = useState('inativo')

  const processar = useCallback(async () => {
    if (!videoRef.current?.srcObject) return
    try {
      const canvas = document.createElement('canvas')
      canvas.width  = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0)

      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.8))
      const form = new FormData()
      form.append('file', blob, 'frame.jpg')

      const { data } = await identificarFrame(form)
      setIdentificados(data.identificados || [])

      if (data.entrada_registrada) {
        const novos = (data.identificados || []).map(p => ({
          nome:      p.nome,
          confianca: p.confianca,
          hora:      new Date().toLocaleTimeString('pt-BR'),
        }))
        setEntradas(prev => [...novos, ...prev].slice(0, 20))
        setStatus('entrada')
      } else if (data.identificados?.length > 0) {
        setStatus('reconhecido')
      } else {
        setStatus('monitorando')
      }
    } catch {
      setStatus('erro')
    }
  }, [])

  async function iniciar() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current.srcObject = stream
    setAtivo(true)
    setStatus('monitorando')
    intervalRef.current = setInterval(processar, INTERVALO_MS)
  }

  function parar() {
    clearInterval(intervalRef.current)
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop())
    setAtivo(false)
    setIdentificados([])
    setStatus('inativo')
  }

  useEffect(() => () => parar(), [])

  const st = STATUS_CONFIG[status] || STATUS_CONFIG.inativo

  return (
    <div style={{ padding: '32px 28px', maxWidth: '1120px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '24px', margin: 0, letterSpacing: '-0.5px',
          }}>
            Painel de Reconhecimento
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '5px 0 0' }}>
            Identificação facial em tempo real
          </p>
        </div>
        <button
          onClick={ativo ? parar : iniciar}
          style={{
            background:   ativo ? 'rgba(244, 63, 94, 0.08)' : 'var(--accent)',
            color:        ativo ? 'var(--danger)' : '#000',
            border:       ativo ? '1px solid rgba(244, 63, 94, 0.3)' : 'none',
            padding:      '10px 26px',
            borderRadius: '8px',
            fontSize:     '14px',
            fontWeight:   700,
            fontFamily:   'Syne, sans-serif',
            cursor:       'pointer',
            transition:   'all 0.2s',
            letterSpacing:'0.3px',
            flexShrink:   0,
          }}
        >
          {ativo ? 'Parar' : 'Iniciar'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
        {/* Camera panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            className={ativo ? 'camera-active-border' : ''}
            style={{
              position:     'relative',
              background:   '#030608',
              borderRadius: '12px',
              overflow:     'hidden',
              aspectRatio:  '16/9',
              display:      'flex',
              alignItems:   'center',
              justifyContent:'center',
              border:       ativo ? '1px solid var(--accent)' : '1px solid var(--border)',
              transition:   'border-color 0.3s',
            }}
          >
            <video ref={videoRef} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

            {/* Scan line */}
            {ativo && <div className="scan-line" />}

            {/* Corner brackets */}
            {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h]) => (
              <div key={`${v}-${h}`} style={{
                position:    'absolute',
                [v]:         '10px',
                [h]:         '10px',
                width:       '18px',
                height:      '18px',
                borderTop:    v === 'top'    ? `2px solid var(--accent)` : 'none',
                borderBottom: v === 'bottom' ? `2px solid var(--accent)` : 'none',
                borderLeft:   h === 'left'   ? `2px solid var(--accent)` : 'none',
                borderRight:  h === 'right'  ? `2px solid var(--accent)` : 'none',
                opacity:     ativo ? 1 : 0.25,
                transition:  'opacity 0.4s',
              }} />
            ))}

            {/* Offline placeholder */}
            {!ativo && (
              <div style={{ position: 'absolute', textAlign: 'center', userSelect: 'none' }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ display: 'block', margin: '0 auto 10px', opacity: 0.2 }}>
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="var(--text-primary)" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" stroke="var(--text-primary)" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="1" fill="var(--text-primary)"/>
                </svg>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Câmera desligada</span>
              </div>
            )}

            {/* Identified overlay */}
            {identificados.map((p, i) => (
              <div key={i} style={{
                position:     'absolute',
                bottom:       '16px',
                left:         '16px',
                background:   'rgba(0, 10, 8, 0.75)',
                border:       '1px solid rgba(0, 229, 160, 0.4)',
                borderRadius: '8px',
                padding:      '8px 14px',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--success)', margin: 0 }}>{p.nome}</div>
                <div style={{ fontSize: '11px', color: 'rgba(0,229,160,0.65)', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
                  {(p.confianca * 100).toFixed(1)}% confiança
                </div>
              </div>
            ))}
          </div>

          {/* Status bar */}
          <div style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '9px',
            padding:      '10px 14px',
            background:   'var(--bg-surface)',
            border:       '1px solid var(--border)',
            borderRadius: '8px',
          }}>
            {st.dot && (
              <div className="status-dot" style={{ background: st.color }} />
            )}
            <span style={{
              fontSize:   '12.5px',
              color:      st.color,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {st.label}
            </span>
            {ativo && (
              <span style={{
                marginLeft:   'auto',
                fontSize:     '11px',
                color:        'var(--text-muted)',
                fontFamily:   'JetBrains Mono, monospace',
              }}>
                {new Date().toLocaleTimeString('pt-BR')}
              </span>
            )}
          </div>
        </div>

        {/* Entry log */}
        <div style={{
          background:    'var(--bg-surface)',
          border:        '1px solid var(--border)',
          borderRadius:  '12px',
          display:       'flex',
          flexDirection: 'column',
          overflow:      'hidden',
          maxHeight:     '480px',
        }}>
          <div style={{
            padding:       '14px 18px',
            borderBottom:  '1px solid var(--border)',
            display:       'flex',
            alignItems:    'center',
            justifyContent:'space-between',
            flexShrink:    0,
          }}>
            <span style={{
              fontSize:      '11px',
              fontWeight:    600,
              color:         'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily:    'Syne, sans-serif',
            }}>
              Entradas
            </span>
            {entradas.length > 0 && (
              <span style={{
                background:   'rgba(0, 229, 160, 0.08)',
                color:        'var(--success)',
                border:       '1px solid rgba(0, 229, 160, 0.25)',
                borderRadius: '999px',
                padding:      '2px 9px',
                fontSize:     '11px',
                fontFamily:   'JetBrains Mono, monospace',
              }}>
                {entradas.length}
              </span>
            )}
          </div>

          <div style={{ overflow: 'auto', flex: 1, padding: '10px' }}>
            {entradas.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '52px 0',
                color: 'var(--text-muted)', fontSize: '13px',
              }}>
                Nenhuma entrada ainda
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {entradas.map((e, i) => (
                  <div key={i} className="entry-card-anim" style={{
                    background:   i === 0 ? 'rgba(0, 229, 160, 0.04)' : 'var(--bg-elevated)',
                    border:       i === 0 ? '1px solid rgba(0, 229, 160, 0.2)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    padding:      '10px 14px',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{e.nome}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {e.hora}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--success)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {(e.confianca * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
