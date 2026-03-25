'use client'

import { useState, useCallback } from 'react'
import { useUploadThing } from '@/lib/uploadthing'
import { Upload, CheckCircle2, AlertCircle, X, Image as ImageIcon } from 'lucide-react'

type FileState = {
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  preview: string
  progress: number
}

export default function PhotographerUploader({ photographerToken }: { photographerToken: string }) {
  const [files, setFiles] = useState<FileState[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const { startUpload, isUploading } = useUploadThing('photographerUpload', {
    headers: {},
    onUploadProgress: (progress) => {
      // Progress is batch-level
      setFiles(prev => prev.map(f =>
        f.status === 'uploading' ? { ...f, progress } : f
      ))
    },
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
    const imageFiles = newFiles.filter(f => f.type.startsWith('image/'))
    const states: FileState[] = imageFiles.map(file => ({
      file,
      status: 'pending',
      preview: URL.createObjectURL(file),
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
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }, [])

  const uploadAll = useCallback(async () => {
    const pending = files.filter(f => f.status === 'pending')
    if (!pending.length) return

    setFiles(prev => prev.map(f =>
      f.status === 'pending' ? { ...f, status: 'uploading', progress: 0 } : f
    ))

    // Upload in batches of 50
    const BATCH = 50
    for (let i = 0; i < pending.length; i += BATCH) {
      const batch = pending.slice(i, i + BATCH).map(f => f.file)
      await startUpload(batch, { photographerToken })
    }
  }, [files, startUpload, photographerToken])

  const pendingCount  = files.filter(f => f.status === 'pending').length
  const doneCount     = files.filter(f => f.status === 'done').length
  const errorCount    = files.filter(f => f.status === 'error').length

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <label
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="block w-full cursor-pointer rounded-2xl border-2 border-dashed transition-colors"
        style={{
          borderColor: isDragging ? 'rgb(99 102 241)' : '#2a2a2a',
          backgroundColor: isDragging ? 'rgba(99,102,241,0.05)' : 'transparent',
          padding: '2.5rem',
        }}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={handleFileInput}
        />
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <Upload className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {isDragging ? 'Suelta aquí' : 'Arrastra fotos o haz clic'}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              JPG, PNG, WEBP · máx. 16 MB por foto
            </p>
          </div>
        </div>
      </label>

      {/* Stats + Upload button */}
      {files.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex gap-4 text-xs text-neutral-400">
            {pendingCount > 0  && <span>{pendingCount} pendientes</span>}
            {doneCount > 0     && <span className="text-emerald-400">{doneCount} subidas</span>}
            {errorCount > 0    && <span className="text-red-400">{errorCount} con error</span>}
          </div>
          {pendingCount > 0 && (
            <button
              onClick={uploadAll}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              {isUploading ? 'Subiendo…' : `Subir ${pendingCount} foto${pendingCount !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      )}

      {/* File grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {files.map((f, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border"
              style={{ borderColor: '#2a2a2a' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.preview}
                alt={f.file.name}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              {f.status === 'pending' && (
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
              {f.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {f.status === 'done' && (
                <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
              )}
              {f.status === 'error' && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {files.length === 0 && (
        <div className="text-center py-4">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-neutral-700" />
          <p className="text-xs text-neutral-600">
            Las fotos subidas aparecerán aquí
          </p>
        </div>
      )}

      {/* All done */}
      {files.length > 0 && pendingCount === 0 && !isUploading && (
        <div className="p-4 rounded-2xl border text-center"
          style={{ borderColor: 'rgba(52,211,153,0.3)', backgroundColor: 'rgba(52,211,153,0.05)' }}>
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-emerald-400">
            {doneCount} foto{doneCount !== 1 ? 's' : ''} subida{doneCount !== 1 ? 's' : ''} correctamente
          </p>
          {errorCount > 0 && (
            <p className="text-xs text-red-400 mt-1">{errorCount} fallaron — vuelve a intentarlo</p>
          )}
        </div>
      )}
    </div>
  )
}
