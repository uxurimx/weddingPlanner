'use client'

import { useState, useActionState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { upsertGift, deleteGift, type ActionState } from '@/db/actions/gifts'
import SubmitButton from '@/components/SubmitButton'

type GiftType = 'registry' | 'bank_transfer' | 'honeymoon' | 'other'
type Gift = {
  id: string; type: GiftType; storeName: string | null; url: string | null
  listNumber: string | null; bankName: string | null; accountHolder: string | null
  accountNumber: string | null; clabe: string | null; description: string | null; isActive: boolean
}

const input = "w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--fg)" }
const lbl = "block text-xs font-semibold uppercase tracking-wide mb-1.5"

const TYPE_LABELS: Record<GiftType, { label: string; emoji: string; color: string }> = {
  registry:      { label: 'Tienda / Lista',     emoji: '🏬', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
  bank_transfer: { label: 'Transferencia',       emoji: '🏦', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  honeymoon:     { label: 'Luna de miel',        emoji: '✈️', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  other:         { label: 'Otro',                emoji: '🎁', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
}

function GiftForm({ gift, onCancel }: { gift?: Gift | null; onCancel: () => void }) {
  const [type, setType] = useState<GiftType>(gift?.type ?? 'registry')
  const router = useRouter()

  const [state, action] = useActionState(
    async (prev: ActionState, fd: FormData) => {
      const res = await upsertGift(prev, fd)
      if (res?.success) { onCancel(); router.refresh() }
      return res
    },
    null,
  )

  return (
    <div className="p-5 rounded-2xl border-2 space-y-4"
      style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--accent)", borderStyle: "dashed" }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
          {gift ? 'Editar regalo' : 'Nuevo regalo'}
        </p>
        <button type="button" onClick={onCancel}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--surface)] transition-colors">
          <X className="w-4 h-4" style={{ color: "var(--fg-muted)" }} />
        </button>
      </div>

      <form action={action} className="space-y-4">
        {gift && <input type="hidden" name="id" value={gift.id} />}
        <input type="hidden" name="type" value={type} />

        {/* Type selector */}
        <div>
          <label className={lbl} style={{ color: "var(--fg-muted)" }}>Tipo</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(TYPE_LABELS) as GiftType[]).map(t => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all ${
                  type === t ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'hover:bg-[var(--surface)]'
                }`}
                style={type === t ? {} : { borderColor: "var(--border)", color: "var(--fg-muted)" }}>
                <span className="text-lg">{TYPE_LABELS[t].emoji}</span>
                {TYPE_LABELS[t].label}
              </button>
            ))}
          </div>
        </div>

        {/* Registry fields */}
        {type === 'registry' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl} style={{ color: "var(--fg-muted)" }}>Nombre de la tienda *</label>
                <input name="storeName" defaultValue={gift?.storeName ?? ''} placeholder="Liverpool" required
                  className={input} style={inputStyle} />
              </div>
              <div>
                <label className={lbl} style={{ color: "var(--fg-muted)" }}>Número de lista</label>
                <input name="listNumber" defaultValue={gift?.listNumber ?? ''} placeholder="51947675"
                  className={input} style={inputStyle} />
              </div>
            </div>
            <div>
              <label className={lbl} style={{ color: "var(--fg-muted)" }}>Link de la tienda</label>
              <input name="url" defaultValue={gift?.url ?? ''} placeholder="https://www.liverpool.com.mx/..."
                className={input} style={inputStyle} />
            </div>
          </div>
        )}

        {/* Bank transfer fields */}
        {type === 'bank_transfer' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl} style={{ color: "var(--fg-muted)" }}>Banco</label>
                <input name="bankName" defaultValue={gift?.bankName ?? ''} placeholder="BBVA"
                  className={input} style={inputStyle} />
              </div>
              <div>
                <label className={lbl} style={{ color: "var(--fg-muted)" }}>Titular</label>
                <input name="accountHolder" defaultValue={gift?.accountHolder ?? ''} placeholder="Nombre del titular"
                  className={input} style={inputStyle} />
              </div>
            </div>
            <div>
              <label className={lbl} style={{ color: "var(--fg-muted)" }}>Número de tarjeta / cuenta</label>
              <input name="accountNumber" defaultValue={gift?.accountNumber ?? ''} placeholder="4152 2929 2680 6136"
                className={input} style={inputStyle} />
            </div>
            <div>
              <label className={lbl} style={{ color: "var(--fg-muted)" }}>CLABE interbancaria</label>
              <input name="clabe" defaultValue={gift?.clabe ?? ''} placeholder="002180xxxxx"
                className={input} style={inputStyle} />
            </div>
          </div>
        )}

        {/* Honeymoon / Other fields */}
        {(type === 'honeymoon' || type === 'other') && (
          <div className="space-y-3">
            <div>
              <label className={lbl} style={{ color: "var(--fg-muted)" }}>Nombre / Título</label>
              <input name="storeName" defaultValue={gift?.storeName ?? ''} placeholder="Luna de miel"
                className={input} style={inputStyle} />
            </div>
            <div>
              <label className={lbl} style={{ color: "var(--fg-muted)" }}>Link (opcional)</label>
              <input name="url" defaultValue={gift?.url ?? ''} placeholder="https://..."
                className={input} style={inputStyle} />
            </div>
          </div>
        )}

        {/* Description (all types) */}
        <div>
          <label className={lbl} style={{ color: "var(--fg-muted)" }}>Descripción</label>
          <input name="description" defaultValue={gift?.description ?? ''}
            placeholder="Ej: Para el hogar, luna de miel, etc."
            className={input} style={inputStyle} />
        </div>

        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}

        <SubmitButton>{gift ? 'Actualizar' : 'Agregar regalo'}</SubmitButton>
      </form>
    </div>
  )
}

function GiftCard({ gift, onEdit, onDelete }: { gift: Gift; onEdit: () => void; onDelete: () => void }) {
  const meta = TYPE_LABELS[gift.type]

  return (
    <div className="p-5 rounded-2xl border group transition-colors"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
              {gift.storeName ?? gift.bankName ?? meta.label}
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
              {meta.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-500/10 transition-colors">
            <Pencil className="w-3.5 h-3.5 text-indigo-500" />
          </button>
          <button type="button" onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 text-xs" style={{ color: "var(--fg-muted)" }}>
        {gift.listNumber    && <p>Lista: <span className="font-semibold" style={{ color: "var(--fg)" }}>#{gift.listNumber}</span></p>}
        {gift.accountHolder && <p>Titular: <span className="font-semibold" style={{ color: "var(--fg)" }}>{gift.accountHolder}</span></p>}
        {gift.bankName      && !gift.accountHolder && <p>Banco: <span className="font-semibold" style={{ color: "var(--fg)" }}>{gift.bankName}</span></p>}
        {gift.accountNumber && (
          <p>Cuenta: <span className="font-mono font-semibold" style={{ color: "var(--fg)" }}>{gift.accountNumber}</span></p>
        )}
        {gift.clabe && <p>CLABE: <span className="font-mono font-semibold" style={{ color: "var(--fg)" }}>{gift.clabe}</span></p>}
        {gift.url && (
          <a href={gift.url} target="_blank" rel="noopener noreferrer"
            className="block text-indigo-500 hover:text-indigo-400 truncate">
            {gift.url}
          </a>
        )}
        {gift.description && <p className="italic">{gift.description}</p>}
      </div>
    </div>
  )
}

export default function GiftsManager({ gifts }: { gifts: Gift[] }) {
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este regalo?')) return
    startTransition(async () => { await deleteGift(id); router.refresh() })
  }

  return (
    <div className="space-y-4">
      {editing === 'new' ? (
        <GiftForm onCancel={() => setEditing(null)} />
      ) : (
        <button onClick={() => setEditing('new')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-medium transition-colors hover:border-indigo-500/50 hover:text-indigo-500"
          style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>
          <Plus className="w-4 h-4" /> Agregar regalo
        </button>
      )}

      {gifts.length === 0 && editing !== 'new' && (
        <div className="text-center py-12" style={{ color: "var(--fg-muted)" }}>
          <p className="text-sm">No hay regalos registrados aún.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {gifts.map(gift => (
          editing === gift.id
            ? <GiftForm key={gift.id} gift={gift} onCancel={() => setEditing(null)} />
            : <GiftCard key={gift.id} gift={gift}
                onEdit={() => setEditing(gift.id)}
                onDelete={() => handleDelete(gift.id)} />
        ))}
      </div>
    </div>
  )
}
