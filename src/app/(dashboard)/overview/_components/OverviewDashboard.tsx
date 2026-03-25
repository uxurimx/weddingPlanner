'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, CheckCircle, ScanLine, Camera, ArrowRight,
  TrendingUp, Clock, X, CheckCircle2, Ban, Video
} from 'lucide-react'
import PusherClient from 'pusher-js'
import type { DashboardStats, ActivityItem } from '@/db/actions/overview'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  confirmation: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  cancellation: <Ban className="w-3.5 h-3.5 text-red-500" />,
  checkin:      <ScanLine className="w-3.5 h-3.5 text-violet-500" />,
  photo:        <Camera className="w-3.5 h-3.5 text-indigo-500" />,
  video:        <Video className="w-3.5 h-3.5 text-blue-500" />,
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'ahora'
  if (mins < 60)  return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, color, href,
}: {
  label: string
  value: number | string
  sub?: string
  icon: React.ElementType
  color: string
  href?: string
}) {
  const inner = (
    <div
      className="p-5 rounded-2xl border h-full"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
          {label}
        </span>
        <div className={`p-1.5 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>
          <Icon className={`w-3.5 h-3.5 text-${color}-500`} />
        </div>
      </div>
      <p className="font-outfit font-bold text-2xl sm:text-3xl mb-1" style={{ color: 'var(--fg)' }}>{value}</p>
      {sub && <p className="text-[11px]" style={{ color: 'var(--fg-muted)' }}>{sub}</p>}
    </div>
  )
  if (href) {
    return <Link href={href} className="block hover:opacity-90 transition-opacity">{inner}</Link>
  }
  return inner
}

// ─── Progress Bar Row ─────────────────────────────────────────────────────────

function FunnelRow({ label, value, total, color }: {
  label: string; value: number; total: number; color: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{label}</span>
        <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--fg)' }}>
          {value} <span style={{ color: 'var(--fg-muted)' }}>({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: `var(--${color}, #818cf8)` }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OverviewDashboard({
  stats: initialStats,
  feed: initialFeed,
  greeting,
  daysLeft,
}: {
  stats: DashboardStats
  feed: ActivityItem[]
  greeting: string
  daysLeft: number
}) {
  const router = useRouter()
  const [feed, setFeed] = useState<ActivityItem[]>(initialFeed)

  // Pusher: live refresh on any admin event
  useEffect(() => {
    const key     = process.env.NEXT_PUBLIC_PUSHER_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    if (!key || !cluster) return

    const pusher  = new PusherClient(key, { cluster })

    // Subscribe to both channels
    const adminChannel  = pusher.subscribe('wedding-admin')
    const checkinChannel = pusher.subscribe('wedding-checkin')

    const onNotification = (data: { id: string; type: string; message: string; sentAt: string }) => {
      const item: ActivityItem = {
        id:      data.id,
        type:    data.type,
        message: data.message,
        isRead:  false,
        sentAt:  new Date(data.sentAt),
      }
      setFeed(prev => [item, ...prev].slice(0, 15))
      router.refresh()
    }

    adminChannel.bind('notification', onNotification)
    checkinChannel.bind('guest-arrived', () => router.refresh())

    return () => pusher.disconnect()
  }, [router])

  const s = initialStats
  const rsvpTotal = s.confirmed + s.cancelled + s.pending

  return (
    <div className="p-4 sm:p-8 max-w-5xl space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
          Dashboard
        </p>
        <h1 className="font-outfit font-bold text-3xl" style={{ color: 'var(--fg)' }}>
          {greeting}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--fg-muted)' }}>
          {daysLeft > 0
            ? `Faltan ${daysLeft} días para la boda · 6 de junio, 2026`
            : '¡Hoy es el gran día! 06·06·2026'}
        </p>
      </div>

      {/* Check-in progress banner (only show if there are presents) */}
      {s.present > 0 && (
        <Link href="/checkin">
          <div
            className="flex items-center gap-4 p-4 rounded-2xl border hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 flex-shrink-0">
              <ScanLine className="w-5 h-5 text-violet-500" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                  Check-in en curso
                </p>
                <p className="text-xs font-semibold text-violet-500">
                  {s.presentPasses} / {s.totalPasses} pases
                </p>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700 bg-violet-500"
                  style={{ width: s.totalPasses > 0 ? `${Math.round(s.presentPasses / s.totalPasses * 100)}%` : '0%' }}
                />
              </div>
            </div>
            <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--fg-muted)' }} />
          </div>
        </Link>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Invitaciones"
          value={s.totalInvitations}
          sub={`${s.totalPasses} pases totales`}
          icon={Users}
          color="indigo"
          href="/guests"
        />
        <StatCard
          label="Confirmados"
          value={s.confirmed}
          sub={`${s.confirmedPasses} pases confirmados`}
          icon={CheckCircle}
          color="emerald"
          href="/guests"
        />
        <StatCard
          label="Presentes"
          value={s.present}
          sub={s.totalPasses > 0 ? `${Math.round(s.presentPasses / s.totalPasses * 100)}% del total` : '—'}
          icon={ScanLine}
          color="violet"
          href="/checkin"
        />
        <StatCard
          label="Fotos & Videos"
          value={s.photos + s.videos}
          sub={`${s.photos} fotos · ${s.videos} videos`}
          icon={Camera}
          color="rose"
          href="/social"
        />
      </div>

      {/* RSVP Funnel + Activity Feed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* RSVP Funnel */}
        <div
          className="p-5 rounded-2xl border space-y-4"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
              RSVP
            </p>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
          </div>
          <div className="space-y-3">
            <FunnelRow label="Confirmados" value={s.confirmed}  total={s.totalInvitations} color="accent" />
            <FunnelRow label="Cancelados"  value={s.cancelled}  total={s.totalInvitations} color="accent" />
            <FunnelRow label="Pendientes"  value={s.pending}    total={s.totalInvitations} color="accent" />
          </div>
          <div className="pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Confirmados', value: s.confirmed,  color: 'text-emerald-500' },
                { label: 'Cancelados',  value: s.cancelled,  color: 'text-red-500' },
                { label: 'Pendientes',  value: s.pending,    color: 'text-yellow-500' },
              ].map(item => (
                <div key={item.label}>
                  <p className={`font-outfit font-bold text-xl ${item.color}`}>{item.value}</p>
                  <p className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--fg-muted)' }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div
          className="p-5 rounded-2xl border flex flex-col"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
              Actividad reciente
            </p>
            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
          </div>

          {feed.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-center" style={{ color: 'var(--fg-muted)' }}>
                Sin actividad reciente.
                <br />Las confirmaciones, check-ins y fotos aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-1 overflow-y-auto max-h-48">
              {feed.map(item => (
                <div key={item.id} className="flex items-start gap-2.5 py-1.5">
                  <div className="flex-shrink-0 mt-0.5 p-1 rounded-md"
                    style={{ backgroundColor: 'var(--bg)' }}>
                    {ACTIVITY_ICON[item.type] ?? <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug truncate" style={{ color: 'var(--fg)' }}>
                      {item.message ?? item.type}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--fg-muted)' }}>
                      {timeAgo(item.sentAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
