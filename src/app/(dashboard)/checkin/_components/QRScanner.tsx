'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Camera, Scan } from 'lucide-react'
import jsQR from 'jsqr'

type ScannerState = 'idle' | 'starting' | 'scanning' | 'error'

function extractToken(raw: string): string | null {
  const m = raw.match(/\/[iq]r?\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)
    ?? raw.match(/\/i\/([0-9a-f-]{36})/i)
  return m ? m[1] : null
}

function getErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return `No se pudo acceder a la cámara. (${String(err)})`
  const name = err.name
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Permiso de cámara denegado. Toca el ícono de cámara en la barra del navegador y permite el acceso.'
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'No se detectó cámara en este dispositivo.'
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'La cámara está siendo usada por otra app. Ciérrala e intenta de nuevo.'
  }
  if (name === 'OverconstrainedError') {
    return 'La cámara trasera no está disponible. Intenta con otro dispositivo.'
  }
  return `Error de cámara: ${name} — ${err.message}`
}

export default function QRScanner({ onToken }: { onToken: (token: string) => void }) {
  const videoRef     = useRef<HTMLVideoElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const streamRef    = useRef<MediaStream | null>(null)
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastTokenRef = useRef<string | null>(null)
  const [state, setState]       = useState<ScannerState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const stopScanner = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    lastTokenRef.current = null
    setState('idle')
  }, [])

  useEffect(() => () => stopScanner(), [stopScanner])

  const startScanner = useCallback(async () => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // Clear previous error
    setErrorMsg(null)

    // Check HTTPS before attempting getUserMedia
    const isSecure =
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'

    if (!isSecure) {
      setErrorMsg('El escáner requiere conexión segura (HTTPS).')
      setState('error')
      return
    }

    setState('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      video.srcObject = stream
      await video.play()
      setState('scanning')

      const ctx = canvas.getContext('2d', { willReadFrequently: true })!

      timerRef.current = setInterval(() => {
        if (video.readyState < 2) return
        canvas.width  = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })
        if (code) {
          const token = extractToken(code.data)
          if (token && token !== lastTokenRef.current) {
            lastTokenRef.current = token
            stopScanner()
            onToken(token)
          }
        }
      }, 250)
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
      setState('error')
    }
  }, [onToken, stopScanner])

  return (
    <div className="space-y-3">
      {(state === 'idle' || state === 'error') ? (
        <button
          onClick={startScanner}
          className="w-full py-10 rounded-2xl border-2 border-dashed flex flex-col items-center gap-3 transition-all hover:border-indigo-500/50 active:scale-[0.99]"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
        >
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <Camera className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
              {state === 'error' ? 'Reintentar escáner' : 'Activar escáner QR'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>
              Funciona en Chrome, Safari y Firefox
            </p>
            {state === 'error' && errorMsg && (
              <p className="text-xs text-red-500 mt-2 leading-relaxed">{errorMsg}</p>
            )}
          </div>
        </button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          <video ref={videoRef} className="w-full aspect-video object-cover" playsInline muted />
          {/* Viewfinder overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-52 h-52 relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-indigo-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-indigo-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-indigo-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-indigo-400 rounded-br-lg" />
              <Scan className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 opacity-60 animate-pulse" />
            </div>
          </div>
          <button
            onClick={stopScanner}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: 'white' }}
          >
            Detener
          </button>
          {state === 'starting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
      {/* Hidden canvas for frame decoding */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
