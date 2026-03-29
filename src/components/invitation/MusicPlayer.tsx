'use client'

import { useEffect, useRef, useState } from 'react'
import { Music, Pause, Play, X } from 'lucide-react'

interface Props {
  src: string
  title?: string | null
}

export default function MusicPlayer({ src, title }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.5
    audio.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
    return () => { audio.pause() }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true))
    }
  }

  function dismiss() {
    audioRef.current?.pause()
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />

      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 16,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'white',
          borderRadius: 999,
          padding: '7px 10px 7px 12px',
          boxShadow: '0 2px 14px rgba(0,0,0,0.13)',
          border: '1px solid var(--w-blue-border)',
        }}
      >
        {/* Play / Pause */}
        <button
          onClick={toggle}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          aria-label={playing ? 'Pausar música' : 'Reproducir música'}
        >
          <Music style={{ width: 13, height: 13, color: 'var(--w-blue)' }} />
          {playing
            ? <Pause style={{ width: 13, height: 13, color: 'var(--w-blue)' }} />
            : <Play  style={{ width: 13, height: 13, color: 'var(--w-blue)' }} />
          }
          {title && (
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--w-text-muted)',
              maxWidth: 110,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {title}
            </span>
          )}
        </button>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 4px' }}
          aria-label="Cerrar música"
        >
          <X style={{ width: 12, height: 12, color: 'var(--w-text-muted)' }} />
        </button>
      </div>
    </>
  )
}
