'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, RefreshCw, Copy, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react'
import { regeneratePhotographerToken } from '@/db/actions/media'

export default function PhotographerManager({
  photographerToken,
  uploadCount,
}: {
  photographerToken: string | null
  uploadCount: number
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const uploadUrl = photographerToken ? `${origin}/foto/${photographerToken}` : null

  const copyLink = async () => {
    if (!uploadUrl) return
    await navigator.clipboard.writeText(uploadUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = () => {
    if (!confirm('¿Regenerar el token? El link anterior dejará de funcionar.')) return
    setIsRegenerating(true)
    setError(null)
    startTransition(async () => {
      const res = await regeneratePhotographerToken()
      setIsRegenerating(false)
      if (res.error) {
        setError(res.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Token card */}
      <div
        className="p-4 rounded-2xl border space-y-4"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Link2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
              Link del fotógrafo
            </p>
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
              Comparte este link con el fotógrafo para que pueda subir fotos sin cuenta.
            </p>
          </div>
        </div>

        {uploadUrl ? (
          <div className="space-y-2">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono break-all"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
            >
              {uploadUrl}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors"
                style={{
                  backgroundColor: copied ? 'rgba(16,185,129,0.1)' : 'var(--surface)',
                  borderColor: copied ? 'rgba(16,185,129,0.3)' : 'var(--border)',
                  color: copied ? 'rgb(16,185,129)' : 'var(--fg)',
                }}
              >
                {copied
                  ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copiado</>
                  : <><Copy className="w-3.5 h-3.5" /> Copiar link</>
                }
              </button>
              <a
                href={uploadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-center py-2" style={{ color: 'var(--fg-muted)' }}>
            No hay token configurado.
          </p>
        )}
      </div>

      {/* Stats */}
      <div
        className="flex items-center justify-between p-4 rounded-2xl border"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
            Fotos subidas
          </p>
          <p className="font-outfit font-bold text-3xl mt-0.5" style={{ color: 'var(--fg)' }}>
            {uploadCount}
          </p>
        </div>
        <div className="text-3xl">📸</div>
      </div>

      {/* Regenerate */}
      <div
        className="p-4 rounded-2xl border"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--fg)' }}>
          Regenerar token
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--fg-muted)' }}>
          Si el link se compromete, genera uno nuevo. El link anterior dejará de funcionar.
        </p>
        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-500 mb-3">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          {isRegenerating ? 'Regenerando…' : 'Regenerar token'}
        </button>
      </div>

      {/* Flow guide */}
      <div
        className="p-4 rounded-2xl border space-y-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
          Flujo de uso
        </p>
        {[
          'Copia el link de arriba y envíalo al fotógrafo por WhatsApp o correo.',
          'El fotógrafo abre el link en su computadora o celular.',
          'Selecciona o arrastra hasta 200 fotos por lote.',
          'Las fotos aparecen en la Galería bajo "Fotógrafo".',
        ].map((text, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-500 flex-shrink-0 mt-0.5"
            >
              {i + 1}
            </span>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
