'use client'

import { useState, useTransition } from 'react'
import { Trash2, Maximize2, ImageIcon, Video, AlertCircle } from 'lucide-react'
import { deleteMediaUpload, type MediaRow, type MediaStats } from '@/db/actions/media'
import { useRouter } from 'next/navigation'
import MediaViewer from './MediaViewer'

type Filter = 'all' | 'photographer' | 'guest-photo' | 'guest-video'

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center p-3 rounded-xl border"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <p className={`font-outfit font-bold text-2xl ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--fg-muted)' }}>{label}</p>
    </div>
  )
}

export default function MediaGallery({
  initialPhotos,
  stats,
}: {
  initialPhotos: MediaRow[]
  stats: MediaStats
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [filter, setFilter] = useState<Filter>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  const filtered = initialPhotos.filter(p => {
    if (filter === 'all')          return true
    if (filter === 'photographer') return p.source === 'photographer'
    if (filter === 'guest-photo')  return p.source === 'guest' && p.type === 'photo'
    if (filter === 'guest-video')  return p.source === 'guest' && p.type === 'video'
    return true
  })

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este archivo? Esta acción no se puede deshacer.')) return
    setDeletingId(id)
    setError(null)
    startTransition(async () => {
      const res = await deleteMediaUpload(id)
      setDeletingId(null)
      if (res.error) {
        setError(res.error)
      } else {
        router.refresh()
      }
    })
  }

  const FILTERS: { id: Filter; label: string; count: number }[] = [
    { id: 'all',          label: 'Todo',       count: initialPhotos.length },
    { id: 'photographer', label: 'Fotógrafo',  count: stats.photographerPhotos },
    { id: 'guest-photo',  label: 'Invitados',  count: stats.guestPhotos },
    { id: 'guest-video',  label: 'Videos',     count: stats.guestVideos },
  ]

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Fotos oficiales" value={stats.photographerPhotos} color="text-indigo-500" />
        <StatCard label="Fotos invitados" value={stats.guestPhotos}        color="text-violet-500" />
        <StatCard label="Videos"          value={stats.guestVideos}        color="text-blue-500" />
        <StatCard label="Total"           value={initialPhotos.length}     color="text-emerald-500" />
      </div>

      {/* Filters */}
      <div className="flex gap-1 p-1 rounded-2xl w-fit"
        style={{ backgroundColor: 'var(--surface)' }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
            style={
              filter === f.id
                ? { backgroundColor: 'var(--bg)', color: 'var(--fg)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: 'var(--fg-muted)' }
            }
          >
            {f.label}
            <span className="text-[10px] opacity-60">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-500">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: 'var(--fg-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            {initialPhotos.length === 0
              ? 'Aún no hay archivos subidos.'
              : 'Sin resultados para este filtro.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl overflow-hidden border group cursor-pointer"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
              onClick={() => setViewerIndex(idx)}
            >
              {item.type === 'photo' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.fileName ?? ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <Video className="w-6 h-6" style={{ color: 'var(--fg-muted)' }} />
                  <span className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--fg-muted)' }}>
                    video
                  </span>
                </div>
              )}

              {/* Source badge */}
              <div className="absolute top-1 left-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                  item.source === 'photographer'
                    ? 'bg-indigo-500/80 text-white'
                    : 'bg-violet-500/80 text-white'
                }`}>
                  {item.source === 'photographer' ? '📸' : '🤳'}
                </span>
              </div>

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/20">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                  disabled={deletingId === item.id}
                  className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors disabled:opacity-50"
                >
                  {deletingId === item.id
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Trash2 className="w-4 h-4 text-white" />
                  }
                </button>
              </div>

              {/* Guest name tooltip */}
              {item.familyName && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[9px] text-white truncate">{item.familyName}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewerIndex !== null && (
        <MediaViewer
          items={filtered}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
        />
      )}
    </div>
  )
}
