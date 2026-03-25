'use client'

import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import type { MediaRow } from '@/db/actions/media'

export default function MediaViewer({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: MediaRow[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}) {
  const item = items[index]
  const hasPrev = index > 0
  const hasNext = index < items.length - 1

  const prev = useCallback(() => { if (hasPrev) onNavigate(index - 1) }, [hasPrev, index, onNavigate])
  const next = useCallback(() => { if (hasNext) onNavigate(index + 1) }, [hasNext, index, onNavigate])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowLeft')   prev()
      if (e.key === 'ArrowRight')  next()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, prev, next])

  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between p-3 flex-shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold ${
            item.source === 'photographer'
              ? 'bg-indigo-500/80 text-white'
              : 'bg-violet-500/80 text-white'
          }`}>
            {item.source === 'photographer' ? '📸 Fotógrafo' : `🤳 ${item.familyName ?? 'Invitado'}`}
          </span>
          {item.fileName && (
            <span className="text-xs text-white/40 truncate hidden sm:block">{item.fileName}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={item.url}
            download={item.fileName ?? undefined}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            onClick={e => e.stopPropagation()}
            title="Descargar"
          >
            <Download className="w-4 h-4 text-white" />
          </a>
          <button
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            onClick={onClose}
            title="Cerrar"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Media */}
      <div
        className="flex-1 flex items-center justify-center relative min-h-0 px-12"
        onClick={e => e.stopPropagation()}
      >
        {hasPrev && (
          <button
            className="absolute left-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={prev}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {item.type === 'photo' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.fileName ?? ''}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            key={item.id}
            src={item.url}
            controls
            autoPlay
            className="max-w-full max-h-full"
          />
        )}

        {hasNext && (
          <button
            className="absolute right-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={next}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Counter */}
      <div className="text-center py-2 flex-shrink-0 text-xs text-white/30">
        {index + 1} / {items.length}
      </div>
    </div>
  )
}
