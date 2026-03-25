'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ScanLine, Camera, Loader2 } from 'lucide-react'
import { toggleEventFlag } from '@/db/actions/information'

function Toggle({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
  loading,
}: {
  label: string
  description: string
  icon: React.ElementType
  checked: boolean
  onChange: (v: boolean) => void
  loading: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-2xl border"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-indigo-500" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>{label}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={loading}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50"
        style={{ backgroundColor: checked ? 'var(--accent, #6366f1)' : 'var(--border)' }}
        role="switch"
        aria-checked={checked}
      >
        {loading ? (
          <Loader2 className="absolute inset-0 m-auto w-3 h-3 animate-spin text-white" />
        ) : (
          <span
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
            style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
          />
        )}
      </button>
    </div>
  )
}

export default function EventFlagsPanel({
  initialFlags,
}: {
  initialFlags: { isCheckinActive: boolean; isPostEventActive: boolean }
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [flags, setFlags] = useState(initialFlags)
  const [loading, setLoading] = useState<string | null>(null)

  const handleToggle = (flag: 'isCheckinActive' | 'isPostEventActive', value: boolean) => {
    setLoading(flag)
    setFlags(prev => ({ ...prev, [flag]: value }))
    startTransition(async () => {
      const res = await toggleEventFlag(flag, value)
      setLoading(null)
      if (res?.error) {
        // Revert on error
        setFlags(prev => ({ ...prev, [flag]: !value }))
      } else {
        router.refresh()
      }
    })
  }

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--fg-muted)' }}>
        Controles del evento
      </h2>
      <div className="space-y-2">
        <Toggle
          label="Check-in activo"
          description="Permite el escáner QR y el registro de entrada en /checkin. Activa el día del evento."
          icon={ScanLine}
          checked={flags.isCheckinActive}
          onChange={v => handleToggle('isCheckinActive', v)}
          loading={loading === 'isCheckinActive'}
        />
        <Toggle
          label="Galería post-evento activa"
          description="Habilita que los invitados suban fotos y videos en /r/[token]. Activa después del evento."
          icon={Camera}
          checked={flags.isPostEventActive}
          onChange={v => handleToggle('isPostEventActive', v)}
          loading={loading === 'isPostEventActive'}
        />
      </div>
    </section>
  )
}
