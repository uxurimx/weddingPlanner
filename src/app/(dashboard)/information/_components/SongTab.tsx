'use client'

import { useActionState, useState } from 'react'
import { upsertSong, type ActionState } from '@/db/actions/information'
import SubmitButton from '@/components/SubmitButton'
import { Music, ExternalLink } from 'lucide-react'

type CoupleData = { songTitle: string | null; songUrl: string | null } | null

const input = "w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--fg)" }
const label = "block text-xs font-semibold uppercase tracking-wide mb-1.5"

function getEmbedUrl(url: string): { type: 'youtube' | 'spotify' | null; embedUrl: string | null } {
  if (!url) return { type: null, embedUrl: null }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` }

  // Spotify track
  const spMatch = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]+)/)
  if (spMatch) return { type: 'spotify', embedUrl: `https://open.spotify.com/embed/track/${spMatch[1]}?utm_source=generator` }

  return { type: null, embedUrl: null }
}

function StatusBar({ state }: { state: ActionState }) {
  if (!state) return null
  return (
    <p className={`text-sm font-medium ${state.success ? 'text-emerald-500' : 'text-red-500'}`}>
      {state.success ? `✓ ${state.message}` : `✗ ${state.error}`}
    </p>
  )
}

export default function SongTab({ couple }: { couple: CoupleData }) {
  const [state, action] = useActionState(upsertSong, null)
  const [previewUrl, setPreviewUrl] = useState(couple?.songUrl ?? '')

  const { type: embedType, embedUrl } = getEmbedUrl(previewUrl)

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4">
        <div>
          <label className={label} style={{ color: "var(--fg-muted)" }}>Título de la canción</label>
          <input name="songTitle" defaultValue={couple?.songTitle ?? ''}
            placeholder="Ej: Perfect — Ed Sheeran"
            className={input} style={inputStyle} />
        </div>

        <div>
          <label className={label} style={{ color: "var(--fg-muted)" }}>URL de YouTube o Spotify</label>
          <input
            name="songUrl"
            defaultValue={couple?.songUrl ?? ''}
            placeholder="https://youtu.be/... o https://open.spotify.com/track/..."
            className={input} style={inputStyle}
            onChange={e => setPreviewUrl(e.target.value)}
          />
          <p className="mt-1.5 text-xs" style={{ color: "var(--fg-muted)" }}>
            Se mostrará como player en la invitación. Compatible con YouTube y Spotify.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <SubmitButton>Guardar canción</SubmitButton>
          <StatusBar state={state} />
        </div>
      </form>

      {/* Preview */}
      <div className="p-5 rounded-2xl border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-4 h-4" style={{ color: "var(--fg-muted)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Vista previa</span>
          {embedUrl && (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-400">
              Abrir original <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {embedUrl ? (
          <div className="rounded-xl overflow-hidden">
            {embedType === 'youtube' && (
              <iframe
                src={embedUrl}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            {embedType === 'spotify' && (
              <iframe
                src={embedUrl}
                className="w-full"
                height="152"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed" style={{ borderColor: "var(--border)" }}>
            <Music className="w-8 h-8 mb-2" style={{ color: "var(--fg-muted)" }} />
            <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
              Ingresa una URL de YouTube o Spotify para ver la vista previa
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
