'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Camera, CameraOff, Scan } from 'lucide-react'

interface BarcodeDetectorAPI {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>
}

declare global {
  interface Window {
    BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorAPI
  }
}

type ScannerState = 'idle' | 'starting' | 'scanning' | 'error'

function extractToken(raw: string): string | null {
  // Matches /i/{uuid} or /qr/{uuid}
  const m = raw.match(/\/[iq]r?\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)
    ?? raw.match(/\/i\/([0-9a-f-]{36})/i)
  return m ? m[1] : null
}

export default function QRScanner({ onToken }: { onToken: (token: string) => void }) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const [state, setState] = useState<ScannerState>('idle')
  const [supported, setSupported] = useState<boolean | null>(null)
  const [lastToken, setLastToken] = useState<string | null>(null)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'BarcodeDetector' in window)
    return () => stopScanner()
  }, [])

  const stopScanner = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setState('idle')
    setLastToken(null)
  }, [])

  const startScanner = useCallback(async () => {
    if (!window.BarcodeDetector || !videoRef.current) return
    setState('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      const video = videoRef.current
      video.srcObject = stream
      await video.play()

      const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
      setState('scanning')

      timerRef.current = setInterval(async () => {
        if (!video || video.readyState < 2) return
        try {
          const barcodes = await detector.detect(video)
          for (const bc of barcodes) {
            const token = extractToken(bc.rawValue)
            if (token && token !== lastToken) {
              setLastToken(token)
              stopScanner()
              onToken(token)
              return
            }
          }
        } catch {
          // ignore decode errors
        }
      }, 300)
    } catch {
      setState('error')
    }
  }, [lastToken, onToken, stopScanner])

  if (supported === false) {
    return (
      <div
        className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-dashed text-center"
        style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
      >
        <CameraOff className="w-8 h-8 opacity-40" />
        <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
          Escáner no disponible en este navegador
        </p>
        <p className="text-xs">
          Usa Chrome en Android / Edge en escritorio, o busca manualmente al invitado abajo.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {state === 'idle' || state === 'error' ? (
        <button
          onClick={startScanner}
          className="w-full py-10 rounded-2xl border-2 border-dashed flex flex-col items-center gap-3 transition-all hover:border-indigo-500/50 active:scale-[0.99]"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
        >
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <Camera className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
              {state === 'error' ? 'Reintentar escáner' : 'Activar escáner QR'}
            </p>
            {state === 'error' && (
              <p className="text-xs text-red-500 mt-1">No se pudo acceder a la cámara</p>
            )}
          </div>
        </button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          <video
            ref={videoRef}
            className="w-full aspect-video object-cover"
            playsInline
            muted
          />
          {/* Scan overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-400 rounded-br-lg" />
              <Scan className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 opacity-60 animate-pulse" />
            </div>
          </div>
          {/* Stop button */}
          <button
            onClick={stopScanner}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-sm transition-colors"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}
          >
            Detener
          </button>
          {state === 'starting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
