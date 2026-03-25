'use client'

import { useState, useTransition } from 'react'
import { Video, Eye, EyeOff, MessageSquareHeart } from 'lucide-react'
import { markVideoMessageViewed, type VideoMessageRow } from '@/db/actions/media'
import { useRouter } from 'next/navigation'

export default function VideoMessagesList({ messages }: { messages: VideoMessageRow[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [playingId, setPlayingId] = useState<string | null>(null)

  const handleMarkViewed = (id: string) => {
    startTransition(async () => {
      await markVideoMessageViewed(id)
      router.refresh()
    })
  }

  if (messages.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-2xl border"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <MessageSquareHeart className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: 'var(--fg-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          Aún no hay mensajes de video para los novios.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {messages.map(msg => (
        <div
          key={msg.id}
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {playingId === msg.id ? (
            <video
              key={msg.id}
              src={msg.url}
              controls
              autoPlay
              className="w-full aspect-video bg-black"
            />
          ) : (
            <button
              className="w-full aspect-video bg-black/80 flex flex-col items-center justify-center gap-2 hover:bg-black/70 transition-colors"
              onClick={() => {
                setPlayingId(msg.id)
                if (!msg.isViewedByCouple) handleMarkViewed(msg.id)
              }}
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <Video className="w-5 h-5 text-rose-400" />
              </div>
              <span className="text-xs text-white/50">Reproducir mensaje</span>
            </button>
          )}

          <div className="p-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                {msg.familyName ?? 'Invitado'}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--fg-muted)' }}>
                {new Date(msg.recordedAt).toLocaleDateString('es-MX', {
                  month: 'short', day: '2-digit', year: 'numeric',
                })}
              </p>
            </div>
            {msg.isViewedByCouple ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                <Eye className="w-3 h-3" /> Visto
              </span>
            ) : (
              <button
                onClick={() => handleMarkViewed(msg.id)}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-colors hover:text-[var(--fg)]"
                style={{ color: 'var(--fg-muted)', borderColor: 'var(--border)' }}
              >
                <EyeOff className="w-3 h-3" /> Marcar visto
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
