'use client'

import { useFormStatus } from 'react-dom'

interface Props {
  children?: React.ReactNode
  loadingText?: string
  variant?: 'primary' | 'danger'
}

export default function SubmitButton({
  children = 'Guardar cambios',
  loadingText = 'Guardando...',
  variant = 'primary',
}: Props) {
  const { pending } = useFormStatus()

  const base   = "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
  const colors = variant === 'danger'
    ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20"
    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"

  return (
    <button type="submit" disabled={pending} className={`${base} ${colors}`}>
      {pending && (
        <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {pending ? loadingText : children}
    </button>
  )
}
