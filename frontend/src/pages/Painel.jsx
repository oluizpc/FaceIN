import { useEffect, useRef, useState, useCallback } from 'react'
import { identificarFrame } from '../api/reconhecimento'

const INTERVALO_MS = 2000

export default function Painel() {
  const videoRef    = useRef(null)
  const intervalRef = useRef(null)

  const [ativo, setAtivo]             = useState(false)
  const [identificados, setIdentificados] = useState([])
  const [entradas, setEntradas]       = useState([])
  const [status, setStatus]           = useState('Painel inativo')

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
        setStatus(`Entrada registrada — ${new Date().toLocaleTimeString('pt-BR')}`)
      } else if (data.identificados?.length > 0) {
        setStatus(`Identificado (já entrou hoje) — ${new Date().toLocaleTimeString('pt-BR')}`)
      } else {
        setStatus(`Monitorando...`)
      }
    } catch {
      setStatus('Erro ao processar frame')
    }
  }, [])

  async function iniciar() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current.srcObject = stream
    setAtivo(true)
    setStatus('Monitorando...')
    intervalRef.current = setInterval(processar, INTERVALO_MS)
  }

  function parar() {
    clearInterval(intervalRef.current)
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop())
    setAtivo(false)
    setIdentificados([])
    setStatus('Painel inativo')
  }

  useEffect(() => () => parar(), [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Painel de Reconhecimento</h1>
        {!ativo
          ? <button onClick={iniciar} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Iniciar</button>
          : <button onClick={parar}   className="bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-600">Parar</button>
        }
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* câmera */}
        <div className="col-span-3 space-y-3">
          <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
            {!ativo && <span className="absolute text-gray-400">Câmera desligada</span>}

            {/* overlay dos identificados */}
            {identificados.map((p, i) => (
              <div key={i} className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur">
                <p className="font-semibold">{p.nome}</p>
                <p className="text-xs text-green-400">Confiança: {(p.confianca * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center">{status}</p>
        </div>

        {/* log de entradas */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm">Entradas registradas</h2>
          <div className="space-y-2 overflow-y-auto max-h-96">
            {entradas.length === 0 && <p className="text-xs text-gray-400 text-center py-8">Nenhuma entrada ainda.</p>}
            {entradas.map((e, i) => (
              <div key={i} className="border border-gray-100 rounded-lg px-3 py-2">
                <p className="text-sm font-medium text-gray-800">{e.nome}</p>
                <p className="text-xs text-gray-400">{e.hora} · {(e.confianca * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
