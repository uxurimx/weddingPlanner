'use client'

import { useState } from 'react'
import { useUploadThing } from '@/lib/uploadthing'
import { Upload, CheckCircle2, ImageIcon } from 'lucide-react'

export default function EventPhotoUploader({ invitationToken }: { invitationToken: string }) {
  const [files, setFiles] = useState<File[]>([])
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { startUpload, isUploading } = useUploadThing('guestUpload', {
    onClientUploadComplete: () => {
      setFiles([])
      setDone(true)
      setError(null)
    },
    onUploadError: () => {
      setError('Error al subir. Intenta de nuevo.')
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!files.length) return
    await startUpload(files, { invitationToken })
  }

  if (done) {
    return (
      <div
        className="p-5 rounded-2xl border text-center space-y-2"
        style={{ backgroundColor: 'white', borderColor: 'var(--w-cream-border)' }}
      >
        <CheckCircle2 className="w-8 h-8 mx-auto" style={{ color: '#22c55e' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--w-text)' }}>
          ¡Fotos compartidas!
        </p>
        <button
          onClick={() => setDone(false)}
          className="text-xs underline"
          style={{ color: 'var(--w-text-muted)' }}
        >
          Subir más fotos
        </button>
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
          multiple
          accept="image/*,video/*"
          className="sr-only"
          onChange={handleChange}
        />
        <ImageIcon className="w-7 h-7 mx-auto mb-2" style={{ color: 'var(--w-text-light)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--w-text-muted)' }}>
          {files.length > 0
            ? `${files.length} archivo${files.length > 1 ? 's' : ''} seleccionado${files.length > 1 ? 's' : ''}`
            : 'Toca para seleccionar fotos o videos'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--w-text-light)' }}>
          JPG, PNG, MP4, MOV · máx. 16 MB fotos · 128 MB videos
        </p>
      </label>

      {error && (
        <p className="text-xs text-center text-red-500">{error}</p>
      )}

      {files.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => setFiles([])}
            className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-opacity hover:opacity-70"
            style={{ borderColor: 'var(--w-cream-border)', color: 'var(--w-text-muted)', backgroundColor: 'white' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--w-blue)' }}
          >
            {isUploading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Subiendo…
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Subir {files.length} archivo{files.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
