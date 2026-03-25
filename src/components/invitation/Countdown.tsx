'use client'

import { useEffect, useState } from 'react'

function calcTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

export default function Countdown({ weddingDate }: { weddingDate: string }) {
  const [time, setTime] = useState(calcTimeLeft(weddingDate))

  useEffect(() => {
    const t = setInterval(() => setTime(calcTimeLeft(weddingDate)), 1000)
    return () => clearInterval(t)
  }, [weddingDate])

  const units = [
    { value: time.days,    label: 'Días' },
    { value: time.hours,   label: 'Horas' },
    { value: time.minutes, label: 'Min' },
    { value: time.seconds, label: 'Seg' },
  ]

  return (
    <div className="flex justify-center gap-3 sm:gap-4">
      {units.map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center gap-1.5">
          <div
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center border"
            style={{ backgroundColor: 'var(--w-cream-dark)', borderColor: 'var(--w-cream-border)' }}
          >
            <span
              className="font-outfit text-2xl font-bold tabular-nums"
              style={{ color: 'var(--w-blue)' }}
            >
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span
            className="text-[9px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--w-text-light)' }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
