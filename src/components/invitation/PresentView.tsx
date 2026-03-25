'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { PublicData } from '@/db/actions/public'
import type { invitations } from '@/db/schema'
import EventPhotoUploader from './EventPhotoUploader'
import VideoMessageUploader from './VideoMessageUploader'

type Props = {
  invitation: typeof invitations.$inferSelect
  event: PublicData['event']
  itinerary: PublicData['itinerary']
  couple: PublicData['couple']
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1" style={{ backgroundColor: 'var(--w-cream-border)' }} />
      <span style={{ color: 'var(--w-gold)', fontSize: 8 }}>◆</span>
      <div className="h-px flex-1" style={{ backgroundColor: 'var(--w-cream-border)' }} />
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2 mb-4">
      <Divider />
      <p
        className="text-center text-[10px] uppercase tracking-[0.3em] font-semibold"
        style={{ color: 'var(--w-text-muted)' }}
      >
        {children}
      </p>
      <Divider />
    </div>
  )
}

/**
 * Parse a time string like "2:30 PM" or "14:30" into a Date object
 * on the given event date.
 */
function parseEventTime(timeStr: string, eventDate: Date): Date | null {
  const m = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
  if (!m) return null
  let hours = parseInt(m[1])
  const mins = parseInt(m[2])
  const period = m[3]?.toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate(),
    hours,
    mins,
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PresentView({ invitation, event, itinerary, couple }: Props) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    // Refresh every minute so the itinerary updates live
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  // Separate upcoming vs past itinerary items
  const visibleItems = itinerary.filter(item => item.isVisible)
  const pastItems = now
    ? visibleItems.filter(item => {
        const t = parseEventTime(item.time, event.date)
        return t !== null && t < now
      })
    : []
  const upcomingItems = now
    ? visibleItems.filter(item => {
        const t = parseEventTime(item.time, event.date)
        return t === null || t >= now
      })
    : visibleItems

  const groomName = couple?.groomName || 'Jahir'
  const brideName = couple?.brideName || 'Gilliane'

  return (
    <div
      className="max-w-lg mx-auto px-6 py-10 space-y-10"
      style={{ color: 'var(--w-text)' }}
    >
      {/* ── Welcome header ─────────────────────────────────────────────────── */}
      <div className="text-center space-y-3 pt-2">
        <p
          className="text-[10px] uppercase tracking-[0.35em]"
          style={{ color: 'var(--w-text-light)' }}
        >
          ¡Bienvenido/a!
        </p>
        <h1
          className="font-outfit text-3xl font-bold"
          style={{ color: 'var(--w-text)' }}
        >
          {invitation.familyName}
        </h1>
        <Divider />
        <p className="text-sm" style={{ color: 'var(--w-text-muted)' }}>
          Qué alegría que estés aquí con nosotros en este día tan especial.
        </p>
      </div>

      {/* ── Video message ──────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader>Mensaje para los novios</SectionHeader>
        <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--w-text-muted)' }}>
          Graba o sube un video de felicitaciones o palabras personales
          para {groomName} y {brideName}.
        </p>
        <VideoMessageUploader
          invitationToken={invitation.token}
          alreadyUploaded={invitation.videoMessageUploaded}
        />
      </section>

      {/* ── Event photos ───────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader>Comparte tus fotos</SectionHeader>
        <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--w-text-muted)' }}>
          ¡Captura el momento! Comparte tus fotos y videos del evento
          con los novios.
        </p>
        <EventPhotoUploader invitationToken={invitation.token} />
      </section>

      {/* ── Itinerary ──────────────────────────────────────────────────────── */}
      {visibleItems.length > 0 && (
        <section>
          <SectionHeader>Programa del día</SectionHeader>
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-[30px] top-3 bottom-3 w-px"
              style={{ backgroundColor: 'var(--w-cream-border)' }}
            />
            <div className="space-y-0">
              {/* Past items – grayed out with checkmark */}
              {pastItems.map(item => (
                <div key={item.id} className="flex gap-4 py-3 relative opacity-40">
                  <div
                    className="w-[60px] h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm z-10 border"
                    style={{ backgroundColor: 'var(--w-cream-dark)', borderColor: 'var(--w-cream-border)' }}
                  >
                    {item.icon || '✓'}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: 'var(--w-blue)' }}
                      >
                        {item.time}
                      </span>
                      <span
                        className="text-sm font-semibold font-outfit line-through"
                        style={{ color: 'var(--w-text)' }}
                      >
                        {item.title}
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-2" style={{ color: '#22c55e' }} />
                </div>
              ))}

              {/* Upcoming items */}
              {upcomingItems.map((item, i) => (
                <div key={item.id} className="flex gap-4 py-3 relative">
                  <div
                    className="w-[60px] h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm z-10 border"
                    style={{
                      backgroundColor: 'var(--w-cream-dark)',
                      borderColor: i === 0 ? 'var(--w-gold)' : 'var(--w-cream-border)',
                    }}
                  >
                    {item.icon || '📌'}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: i === 0 ? 'var(--w-gold)' : 'var(--w-blue)' }}
                      >
                        {item.time}
                      </span>
                      <span
                        className="text-sm font-semibold font-outfit"
                        style={{ color: 'var(--w-text)' }}
                      >
                        {item.title}
                      </span>
                      {i === 0 && now && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
                          style={{ backgroundColor: 'rgba(201,169,110,0.15)', color: 'var(--w-gold)' }}
                        >
                          Ahora
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--w-text-muted)' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="text-center pb-4 space-y-4">
        <Divider />
        <p
          className="font-outfit text-2xl font-bold tracking-wide"
          style={{ color: 'var(--w-gold)' }}
        >
          {groomName} &amp; {brideName}
        </p>
        <p
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--w-text-light)' }}
        >
          06 · 06 · 2026
        </p>
        <Divider />
      </footer>
    </div>
  )
}
