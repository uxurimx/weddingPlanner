'use client'

import { useActionState } from 'react'
import { upsertCouple, type ActionState } from '@/db/actions/information'
import SubmitButton from '@/components/SubmitButton'

type CoupleData = {
  groomName: string; groomNickname: string | null; groomFather: string | null; groomMother: string | null
  brideName: string; brideNickname: string | null; brideFather: string | null; brideMother: string | null
  story: string | null; quote: string | null; quoteSource: string | null; invitationText: string | null
} | null

const input = "w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--fg)" }
const label = "block text-xs font-semibold uppercase tracking-wide mb-1.5"

function Field({ name, label: lbl, placeholder, defaultValue, required }: {
  name: string; label: string; placeholder?: string; defaultValue?: string | null; required?: boolean
}) {
  return (
    <div>
      <label className={label} style={{ color: "var(--fg-muted)" }}>{lbl}{required && ' *'}</label>
      <input name={name} defaultValue={defaultValue ?? ''} placeholder={placeholder}
        required={required} className={input} style={inputStyle} />
    </div>
  )
}

function TextArea({ name, label: lbl, placeholder, defaultValue, rows = 3 }: {
  name: string; label: string; placeholder?: string; defaultValue?: string | null; rows?: number
}) {
  return (
    <div>
      <label className={label} style={{ color: "var(--fg-muted)" }}>{lbl}</label>
      <textarea name={name} defaultValue={defaultValue ?? ''} placeholder={placeholder}
        rows={rows} className={`${input} resize-none`} style={inputStyle} />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-6 mb-6 border-b last:border-b-0 last:mb-0 last:pb-0" style={{ borderColor: "var(--border)" }}>
      <h3 className="font-outfit font-semibold text-base mb-4" style={{ color: "var(--fg)" }}>{title}</h3>
      {children}
    </div>
  )
}

function StatusBar({ state }: { state: ActionState }) {
  if (!state) return null
  return (
    <p className={`text-sm font-medium ${state.success ? 'text-emerald-500' : 'text-red-500'}`}>
      {state.success ? `✓ ${state.message}` : `✗ ${state.error}`}
    </p>
  )
}

export default function CoupleTab({ couple }: { couple: CoupleData }) {
  const [state, action] = useActionState(upsertCouple, null)

  return (
    <form action={action} className="space-y-0">
      <Section title="Novio">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field name="groomName"     label="Nombre completo" placeholder="Jahir Aréchiga Cárdenas" defaultValue={couple?.groomName}    required />
          <Field name="groomNickname" label="Apodo / Nickname"  placeholder="Jair"                   defaultValue={couple?.groomNickname} />
          <Field name="groomFather"   label="Nombre del padre"  placeholder="José Arturo Aréchiga"   defaultValue={couple?.groomFather}   />
          <Field name="groomMother"   label="Nombre de la madre" placeholder="Ana Velia Torres"      defaultValue={couple?.groomMother}   />
        </div>
      </Section>

      <Section title="Novia">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field name="brideName"     label="Nombre completo"  placeholder="Gilliane Sauceda"      defaultValue={couple?.brideName}    required />
          <Field name="brideNickname" label="Apodo / Nickname" placeholder="Gilli"                 defaultValue={couple?.brideNickname} />
          <Field name="brideFather"   label="Nombre del padre" placeholder="Jehú Sauceda González" defaultValue={couple?.brideFather}   />
          <Field name="brideMother"   label="Nombre de la madre" placeholder="Neyda Villarreal"    defaultValue={couple?.brideMother}   />
        </div>
      </Section>

      <Section title="Invitación">
        <div className="space-y-4">
          <TextArea name="invitationText" label="Texto de invitación"
            placeholder="Nos complace que seas parte de este día tan especial."
            defaultValue={couple?.invitationText} rows={2} />
          <TextArea name="story" label="Nuestra historia"
            placeholder="Cuéntale a sus invitados cómo se conocieron..."
            defaultValue={couple?.story} rows={5} />
        </div>
      </Section>

      <Section title="Cita bíblica / Frase">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <TextArea name="quote" label="Cita o frase"
              placeholder='"Me comprometeré contigo para siempre..."'
              defaultValue={couple?.quote} rows={3} />
          </div>
          <Field name="quoteSource" label="Referencia" placeholder="Oseas 2:19" defaultValue={couple?.quoteSource} />
        </div>
      </Section>

      <div className="flex items-center gap-4 pt-2">
        <SubmitButton>Guardar pareja</SubmitButton>
        <StatusBar state={state} />
      </div>
    </form>
  )
}
