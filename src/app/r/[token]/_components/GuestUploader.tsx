'use client'

import { useState, useCallback } from 'react'
import { useUploadThing } from '@/lib/uploadthing'
import { Upload, CheckCircle2, AlertCircle, X, Image as ImageIcon, Video } from 'lucide-react'

type FileState = {
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  preview: string | null  // null for videos
  isVideo: boolean
  progress: number
}

export default function GuestUploader({ invitationToken }: { invitationToken: string }) {
  const [files, setFiles] = useState<FileState[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const { startUpload, isUploading } = useUploadThing('guestUpload', {
    onClientUploadComplete: (res) => {
      const uploadedNames = new Set(res?.map(r => r.name) ?? [])
      setFiles(prev => prev.map(f =>
        uploadedNames.has(f.file.name) ? { ...f, status: 'done', progress: 100 } : f
      ))
    },
    onUploadError: () => {
      setFiles(prev => prev.map(f =>
        f.status === 'uploading' ? { ...f, status: 'error' } : f
      ))
    },
  })

  const addFiles = useCallback((newFiles: File[]) => {
    const valid = newFiles.filter(f =>
      f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    const states: FileState[] = valid.map(file => ({
      file,
      status: 'pending',
      isVideo: file.type.startsWith('video/'),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      progress: 0,
    }))
    setFiles(prev => [...prev, ...states])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }, [addFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files))
    e.target.value = ''
  }, [addFiles])

  const removeFile = useCallback((idx: number) => {
    setFiles(prev => {
      const f = prev[idx]
      if (f.preview) URL.revokeObjectURL(f.preview)
      return prev.filter((_, i) => i !== idx)
    })
  }, [])

  const uploadAll = useCallback(async () => {
    const pending = files.filter(f => f.status === 'pending')
    if (!pending.length) return

    setFiles(prev => prev.map(f =>
      f.status === 'pending' ? { ...f, status: 'uploading', progress: 0 } : f
    ))

    await startUpload(pending.map(f => f.file), { invitationToken })
  }, [files, startUpload, invitationToken])

  const pendingCount = files.filter(f => f.status === 'pending').length
  const doneCount    = files.filter(f => f.status === 'done').length
  const errorCount   = files.filter(f => f.status === 'error').length

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <label
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="block cursor-pointer rounded-2xl border-2 border-dashed transition-colors"
        style={{
          borderColor: isDragging ? 'var(--w-blue)' : 'var(--w-cream-border)',
          backgroundColor: isDragging ? 'rgba(100,130,200,0.05)' : 'transparent',
          padding: '2rem',
        }}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          className="sr-only"
          onChange={handleFileInput}
        />
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 rounded-2xl border"
            style={{ backgroundColor: 'rgba(100,130,200,0.08)', borderColor: 'rgba(100,130,200,0.2)' }}>
            <Upload className="w-6 h-6" style={{ color: 'var(--w-blue)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--w-text)' }}>
              {isDragging ? 'Suelta aquí' : 'Toca para agregar fotos o videos'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--w-text-muted)' }}>
              Fotos: máx. 16 MB · Videos: máx. 128 MB · hasta 3 videos
            </p>
          </div>
        </div>
      </label>

      {/* Stats + Upload button */}
      {files.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-xs" style={{ color: 'var(--w-text-muted)' }}>
            {pendingCount > 0  && <span>{pendingCount} pendientes</span>}
            {doneCount > 0     && <span className="text-emerald-600">{doneCount} listas</span>}
            {errorCount > 0    && <span className="text-red-500">{errorCount} fallaron</span>}
          </div>
          {pendingCount > 0 && (
            <button
              onClick={uploadAll}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors"
              style={{ backgroundColor: 'var(--w-blue)' }}
            >
              {isUploading ? 'Subiendo…' : `Compartir ${pendingCount}`}
            </button>
          )}
        </div>
      )}

      {/* File grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((f, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border"
              style={{ borderColor: 'var(--w-cream-border)', backgroundColor: 'var(--w-cream)' }}>
              {f.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.preview} alt={f.file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-8 h-8" style={{ color: 'var(--w-blue)' }} />
                </div>
              )}
              {/* Remove (pending only) */}
              {f.status === 'pending' && (
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
              {f.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {f.status === 'done' && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(16,185,129,0.2)' }}>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              )}
              {f.status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(239,68,68,0.2)' }}>
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* All done banner */}
      {doneCount > 0 && pendingCount === 0 && !isUploading && (
        <div className="p-4 rounded-2xl text-center border"
          style={{ borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.05)' }}>
          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-emerald-700">
            ¡Gracias! {doneCount} archivo{doneCount !== 1 ? 's' : ''} compartido{doneCount !== 1 ? 's' : ''} con los novios
          </p>
        </div>
      )}
    </div>
  )
}
