'use client'

import { useState } from 'react'
import { useUploadThing } from '@/lib/uploadthing'
import { Video, CheckCircle2, Heart } from 'lucide-react'

export default function VideoMessageUploader({
  invitationToken,
  alreadyUploaded,
}: {
  invitationToken: string
  alreadyUploaded: boolean
}) {
  const [file, setFile] = useState<File | null>(null)
  const [done, setDone] = useState(alreadyUploaded)
  const [error, setError] = useState<string | null>(null)

  const { startUpload, isUploading } = useUploadThing('videoMessage', {
    onClientUploadComplete: () => {
      setFile(null)
      setDone(true)
      setError(null)
    },
    onUploadError: () => {
      setError('Error al enviar el video. Intenta de nuevo.')
    },
  })

  if (done) {
    return (
      <div
        className="p-6 rounded-2xl border text-center space-y-2"
        style={{ backgroundColor: 'white', borderColor: 'var(--w-cream-border)' }}
      >
        <Heart className="w-8 h-8 mx-auto fill-current" style={{ color: 'var(--w-gold)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--w-text)' }}>
          ¡Video enviado con mucho cariño!
        </p>
        <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>
          Los novios lo verán muy pronto.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label
        className="block w-full cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors"
        style={{ borderColor: 'var(--w-cream-border)', backgroundColor: 'white' }}
      >
        <input
          type="file"
          accept="video/*"
          className="sr-only"
          onChange={e => {
            setFile(e.target.files?.[0] ?? null)
            setError(null)
          }}
        />
        <Video className="w-7 h-7 mx-auto mb-2" style={{ color: 'var(--w-text-light)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--w-text-muted)' }}>
          {file ? file.name : 'Toca para seleccionar un video'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--w-text-light)' }}>
          MP4, MOV, AVI · máx. 256 MB
        </p>
      </label>

      {error && (
        <p className="text-xs text-center text-red-500">{error}</p>
      )}

      {file && (
        <button
          onClick={() => startUpload([file], { invitationToken })}
          disabled={isUploading}
          className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--w-gold)' }}
        >
          {isUploading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando video…
            </>
          ) : (
            <>
              <Heart className="w-3.5 h-3.5" />
              Enviar video a los novios
            </>
          )}
        </button>
      )}
    </div>
  )
}
