'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, QrCode, Pencil, Trash2, MessageCircle, FileDown,
  Search, X, Users, FileUp, Send, Merge,
  ChevronDown, ChevronUp, Phone, Mail, MapPin, Clock, UserCheck,
  Baby, UserRound, RotateCcw,
} from 'lucide-react'
import {
  deleteInvitation,
  bulkDeleteInvitations,
  markInvitationSent,
  addGuestMember,
  removeGuestMember,
  revertCancellation,
  type InvitationRow,
  type TableWithOccupancy,
} from '@/db/actions/guests'
import InvitationForm from './InvitationForm'
import QRModal from './QRModal'
import ImportModal from './ImportModal'
import BulkSendModal from './BulkSendModal'
import MergeModal from './MergeModal'

const STATUS_META = {
  created:   { label: 'Creado',     color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  sent:      { label: 'Enviado',    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  viewed:    { label: 'Visto',      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  confirmed: { label: 'Confirmado', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  cancelled: { label: 'Cancelado',  color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  present:   { label: 'Presente',   color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
} as const

const AGE_ICONS: Record<string, React.ElementType> = {
  adult: UserRound,
  child: UserRound,
  baby:  Baby,
}

function fmtDate(d: Date | null | undefined) {
  if (!d) return null
  return new Date(d).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function exportCSV(rows: InvitationRow[]) {
  const headers = ['#', 'Familia', 'Contacto', 'Teléfono', 'Correo', 'Pases', 'Mesa', 'Estado', 'Notas']
  const data = rows.map(r => [
    r.invitationNumber ?? '',
    r.familyName,
    r.contactName,
    r.contactPhone ?? '',
    r.contactEmail ?? '',
    r.totalPasses,
    r.tableNumber ? `Mesa ${r.tableNumber}` : '',
    STATUS_META[r.status].label,
    r.adminNotes ?? '',
  ])
  const csv = [headers, ...data]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'invitados.csv'
  link.click()
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

type SlotEntry = { name: string; ageGroup: 'adult' | 'child' | 'baby' }

function MembersList({ invitation }: { invitation: InvitationRow }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)

  // Single-add state
  const [addingOne, setAddingOne] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAge, setNewAge] = useState<'adult' | 'child' | 'baby'>('adult')

  // Bulk-fill state (N slots at once)
  const missing = invitation.totalPasses - invitation.members.length
  const [bulkMode, setBulkMode] = useState(false)
  const [slots, setSlots] = useState<SlotEntry[]>([])

  function openBulk() {
    setSlots(Array.from({ length: missing }, () => ({ name: '', ageGroup: 'adult' })))
    setBulkMode(true)
    setAddingOne(false)
  }

  function updateSlot(i: number, field: keyof SlotEntry, value: string) {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  async function handleBulkSave() {
    const valid = slots.filter(s => s.name.trim())
    if (valid.length === 0) return
    setSaving(true)
    startTransition(async () => {
      for (const s of valid) {
        await addGuestMember(invitation.id, s.name.trim(), s.ageGroup)
      }
      setSaving(false)
      setBulkMode(false)
      router.refresh()
    })
  }

  function handleAddOne() {
    if (!newName.trim()) return
    startTransition(async () => {
      const res = await addGuestMember(invitation.id, newName.trim(), newAge)
      if (res?.error) alert(res.error)
      else { setNewName(''); setAddingOne(false); router.refresh() }
    })
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      const res = await removeGuestMember(memberId)
      if (res?.error) alert(res.error)
      else router.refresh()
    })
  }

  const AgeLabel = ({ age }: { age: string }) => {
    const Ic = AGE_ICONS[age] ?? UserRound
    return <Ic className="w-3 h-3 flex-shrink-0" />
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
          Integrantes {invitation.members.length > 0 && `(${invitation.members.length}/${invitation.totalPasses})`}
        </p>
        {!bulkMode && !addingOne && (
          <button
            type="button"
            onClick={() => { setAddingOne(true); setBulkMode(false) }}
            className="text-[10px] font-semibold text-indigo-500 hover:underline"
          >
            + Agregar uno
          </button>
        )}
        {(bulkMode || addingOne) && (
          <button
            type="button"
            onClick={() => { setBulkMode(false); setAddingOne(false) }}
            className="text-[10px] font-semibold text-red-400 hover:underline"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* Empty state — invitation with multiple passes and no members */}
      {invitation.members.length === 0 && !bulkMode && !addingOne && (
        <div
          className="p-3 rounded-xl border border-dashed text-center space-y-2"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
            {invitation.totalPasses > 1
              ? `Esta invitación tiene ${invitation.totalPasses} pases. Registra los nombres de cada integrante.`
              : 'Sin integrantes registrados.'}
          </p>
          {invitation.totalPasses > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={openBulk}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                Llenar {invitation.totalPasses} integrantes
              </button>
            </div>
          )}
        </div>
      )}

      {/* Existing members list */}
      {invitation.members.map(m => (
        <div
          key={m.id}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg group"
          style={{ backgroundColor: 'var(--bg)' }}
        >
          <span style={{ color: 'var(--fg-muted)' }}><AgeLabel age={m.ageGroup} /></span>
          <span className="flex-1 text-xs font-medium" style={{ color: 'var(--fg)' }}>{m.name}</span>
          <span className="text-[10px]" style={{ color: 'var(--fg-muted)' }}>
            {m.ageGroup === 'adult' ? 'adulto' : m.ageGroup === 'child' ? 'niño' : 'bebé'}
          </span>
          <button
            type="button"
            onClick={() => handleRemove(m.id)}
            className="opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity ml-1"
            title="Quitar integrante"
          >
            <X className="w-3 h-3 text-red-400" />
          </button>
        </div>
      ))}

      {/* "Add more" link when some members exist but not all passes filled */}
      {invitation.members.length > 0 && missing > 0 && !bulkMode && !addingOne && (
        <button
          type="button"
          onClick={openBulk}
          className="w-full text-xs py-1.5 rounded-lg border border-dashed transition-colors hover:border-indigo-500/50 hover:text-indigo-500"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
        >
          + Agregar {missing} integrante{missing !== 1 ? 's' : ''} restante{missing !== 1 ? 's' : ''}
        </button>
      )}

      {/* Bulk fill form */}
      {bulkMode && (
        <div
          className="p-3 rounded-xl border space-y-2"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--fg-muted)' }}>
            Ingresa los nombres ({slots.length} pases)
          </p>
          {slots.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                autoFocus={i === 0}
                value={s.name}
                onChange={e => updateSlot(i, 'name', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && i < slots.length - 1 &&
                  (document.getElementById(`slot-${invitation.id}-${i + 1}`) as HTMLInputElement)?.focus()
                }
                id={`slot-${invitation.id}-${i}`}
                placeholder={`Integrante ${i + 1}`}
                className="flex-1 px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--fg)' }}
              />
              <select
                value={s.ageGroup}
                onChange={e => updateSlot(i, 'ageGroup', e.target.value)}
                className="px-2 py-1.5 rounded-lg border text-xs focus:outline-none"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--fg)' }}
              >
                <option value="adult">Adulto</option>
                <option value="child">Niño</option>
                <option value="baby">Bebé</option>
              </select>
            </div>
          ))}
          <button
            type="button"
            onClick={handleBulkSave}
            disabled={saving || slots.every(s => !s.name.trim())}
            className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 transition-colors"
          >
            {saving ? 'Guardando…' : 'Guardar integrantes'}
          </button>
        </div>
      )}

      {/* Single-add form */}
      {addingOne && (
        <div className="flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddOne()}
            placeholder="Nombre del integrante"
            className="flex-1 px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
          />
          <select
            value={newAge}
            onChange={e => setNewAge(e.target.value as 'adult' | 'child' | 'baby')}
            className="px-2 py-1.5 rounded-lg border text-xs focus:outline-none"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
          >
            <option value="adult">Adulto</option>
            <option value="child">Niño</option>
            <option value="baby">Bebé</option>
          </select>
          <button
            type="button"
            onClick={handleAddOne}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
          >
            OK
          </button>
        </div>
      )}
    </div>
  )
}

function InvitationDetailPanel({
  invitation,
  tables,
  onEdit,
  onDelete,
  onQR,
  onRevert,
}: {
  invitation: InvitationRow
  tables: TableWithOccupancy[]
  onEdit: () => void
  onDelete: () => void
  onQR: () => void
  onRevert: () => void
}) {
  const sm = STATUS_META[invitation.status]
  const tableName = invitation.tableNumber
    ? (invitation.tableName ?? `Mesa ${invitation.tableNumber}`)
    : null

  const timeline = [
    { label: 'Enviado',    date: invitation.sentAt },
    { label: 'Visto',      date: invitation.viewedAt },
    { label: 'Confirmado', date: invitation.confirmedAt },
    { label: 'Presente',   date: invitation.checkedInAt },
    { label: 'Cancelado',  date: invitation.cancelledAt },
  ].filter(t => t.date)

  const waLink = invitation.contactPhone
    ? `https://web.whatsapp.com/send?phone=${
        invitation.contactPhone.replace(/\D/g, '').length === 10
          ? '52' + invitation.contactPhone.replace(/\D/g, '')
          : invitation.contactPhone.replace(/\D/g, '')
      }&text=${encodeURIComponent(
        `¡Hola ${invitation.contactName}! 💍\n\nAquí tu invitación digital:\n\n${typeof window !== 'undefined' ? window.location.origin : ''}/i/${invitation.token}`,
      )}`
    : null

  return (
    <div
      className="mx-1 mb-1 rounded-b-2xl border border-t-0 overflow-hidden"
      style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--surface-2)' }}
    >
      {/* Quick actions bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <button
          type="button"
          onClick={onQR}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors hover:border-indigo-500/50 hover:text-indigo-500"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
        >
          <QrCode className="w-3.5 h-3.5" /> QR
        </button>

        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors hover:border-emerald-500/50 hover:text-emerald-500"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
        )}

        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors hover:border-indigo-500/50 hover:text-indigo-500"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
        >
          <Pencil className="w-3.5 h-3.5" /> Editar
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors hover:border-red-500/30 hover:text-red-500"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
        >
          <Trash2 className="w-3.5 h-3.5" /> Eliminar
        </button>

        {invitation.status === 'cancelled' && (
          <button
            type="button"
            onClick={onRevert}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors hover:border-emerald-500/30 hover:text-emerald-500"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reactivar
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left: contact + details */}
        <div className="space-y-3">
          {/* Contact */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>Contacto</p>
            {invitation.contactPhone ? (
              <a
                href={`tel:${invitation.contactPhone}`}
                className="flex items-center gap-2 text-sm hover:text-indigo-500 transition-colors"
                style={{ color: 'var(--fg)' }}
              >
                <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--fg-muted)' }} />
                {invitation.contactPhone}
              </a>
            ) : (
              <p className="text-xs italic flex items-center gap-2" style={{ color: 'var(--fg-muted)' }}>
                <Phone className="w-3.5 h-3.5" /> Sin teléfono
              </p>
            )}
            {invitation.contactEmail && (
              <a
                href={`mailto:${invitation.contactEmail}`}
                className="flex items-center gap-2 text-sm hover:text-indigo-500 transition-colors"
                style={{ color: 'var(--fg)' }}
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--fg-muted)' }} />
                {invitation.contactEmail}
              </a>
            )}
          </div>

          {/* Table + passes + status */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>Detalles</p>
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${sm.color}`}>
                {sm.label}
              </span>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
              >
                <Users className="w-3 h-3" />
                {invitation.totalPasses} pase{invitation.totalPasses !== 1 ? 's' : ''}
                {invitation.confirmedCount != null && invitation.confirmedCount > 0
                  ? ` · ${invitation.confirmedCount} confirmados`
                  : ''}
              </span>
              {tableName && (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
                >
                  <MapPin className="w-3 h-3" /> {tableName}
                </span>
              )}
            </div>
          </div>

          {/* Timeline */}
          {timeline.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>Historial</p>
              {timeline.map(t => (
                <div key={t.label} className="flex items-center gap-2 text-xs" style={{ color: 'var(--fg-muted)' }}>
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span className="font-medium" style={{ color: 'var(--fg)' }}>{t.label}</span>
                  <span>{fmtDate(t.date)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {(invitation.adminNotes || invitation.dietaryNotes || invitation.confirmationMessage) && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>Notas</p>
              {invitation.confirmationMessage && (
                <p className="text-xs italic px-2 py-1.5 rounded-lg border-l-2 border-emerald-500/50" style={{ color: 'var(--fg)' }}>
                  "{invitation.confirmationMessage}"
                </p>
              )}
              {invitation.dietaryNotes && (
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  🍽 {invitation.dietaryNotes}
                </p>
              )}
              {invitation.adminNotes && (
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  📝 {invitation.adminNotes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: family members */}
        <div>
          <MembersList invitation={invitation} />
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InvitationsTab({
  invitations,
  tables,
}: {
  invitations: InvitationRow[]
  tables: TableWithOccupancy[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [editing, setEditing]       = useState<string | 'new' | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [qrFor, setQrFor]           = useState<InvitationRow | null>(null)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState<string>('')
  const [tableFilter, setTable]     = useState<string>('')
  const [showImport, setShowImport] = useState(false)
  const [selected, setSelected]     = useState<Set<string>>(new Set())
  const [showSend, setShowSend]     = useState(false)
  const [showMerge, setShowMerge]   = useState(false)

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalPasses     = invitations.reduce((s, i) => s + i.totalPasses, 0)
  const confirmedPasses = invitations
    .filter(i => ['confirmed', 'present'].includes(i.status))
    .reduce((s, i) => s + (i.confirmedCount ?? i.totalPasses), 0)
  const pendingCount    = invitations.filter(i => ['created', 'sent', 'viewed'].includes(i.status)).length
  const cancelledCount  = invitations.filter(i => i.status === 'cancelled').length

  // ─── Filters ──────────────────────────────────────────────────────────────
  const filtered = invitations.filter(inv => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || inv.familyName.toLowerCase().includes(q)
      || inv.contactName.toLowerCase().includes(q)
      || String(inv.invitationNumber ?? '').includes(q)
      || inv.members.some(m => m.name.toLowerCase().includes(q))
    const matchStatus = !statusFilter || inv.status === statusFilter
    const matchTable  = !tableFilter
      || (tableFilter === '__none__' ? !inv.tableId : inv.tableId === tableFilter)
    return matchSearch && matchStatus && matchTable
  })

  // ─── Selection helpers ────────────────────────────────────────────────────
  const selectedRows = invitations.filter(i => selected.has(i.id))
  const allVisibleSelected = filtered.length > 0 && filtered.every(i => selected.has(i.id))

  function toggleAll() {
    if (allVisibleSelected) {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(i => n.delete(i.id)); return n })
    } else {
      setSelected(prev => new Set([...prev, ...filtered.map(i => i.id)]))
    }
  }

  function toggle(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function selectAllCreated() {
    setSelected(new Set(invitations.filter(i => i.status === 'created').map(i => i.id)))
  }

  // ─── Actions ──────────────────────────────────────────────────────────────
  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta invitación?')) return
    startTransition(async () => {
      await deleteInvitation(id)
      if (selectedId === id) setSelectedId(null)
      router.refresh()
    })
  }

  function handleMarkSent(id: string) {
    startTransition(async () => { await markInvitationSent(id); router.refresh() })
  }

  function handleBulkDelete() {
    const names = selectedRows.slice(0, 3).map(r => r.familyName).join(', ')
    const suffix = selectedRows.length > 3 ? ` y ${selectedRows.length - 3} más` : ''
    if (!confirm(`¿Eliminar ${selected.size} invitaciones?\n\n${names}${suffix}`)) return
    startTransition(async () => {
      await bulkDeleteInvitations([...selected])
      setSelected(new Set())
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {[
          { label: 'Invitaciones', value: invitations.length },
          { label: 'Total pases',  value: totalPasses },
          { label: 'Confirmados',  value: confirmedPasses, accent: 'text-emerald-500' },
          { label: 'Pendientes',   value: pendingCount,    accent: 'text-yellow-500' },
          { label: 'Cancelados',   value: cancelledCount,  accent: 'text-red-500' },
        ].map(s => (
          <div
            key={s.label}
            className="p-3 rounded-xl border text-center"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className={`text-xl font-bold font-outfit ${s.accent ?? ''}`} style={s.accent ? {} : { color: 'var(--fg)' }}>
              {s.value}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: 'var(--fg-muted)' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar familia, contacto, integrante..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border text-sm focus:outline-none transition-colors"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_META).map(([v, m]) => (
            <option key={v} value={v}>{m.label}</option>
          ))}
        </select>

        {tables.length > 0 && (
          <select
            value={tableFilter}
            onChange={e => setTable(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
          >
            <option value="">Todas las mesas</option>
            <option value="__none__">Sin mesa</option>
            {tables.map(t => (
              <option key={t.id} value={t.id}>{t.name ?? `Mesa ${t.number}`}</option>
            ))}
          </select>
        )}

        <button
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors hover:border-indigo-500/50"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
        >
          <FileDown className="w-3.5 h-3.5" /> CSV
        </button>

        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors hover:border-emerald-500/50 hover:text-emerald-500"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
        >
          <FileUp className="w-3.5 h-3.5" /> Importar
        </button>
      </div>

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      {/* Bulk selection shortcuts */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm" style={{ color: 'var(--fg-muted)' }}>
          <input
            type="checkbox"
            checked={allVisibleSelected && filtered.length > 0}
            onChange={toggleAll}
            className="w-3.5 h-3.5 rounded accent-indigo-500"
          />
          Seleccionar visibles
        </label>
        <button
          onClick={selectAllCreated}
          className="text-xs px-2.5 py-1 rounded-lg border transition-colors hover:border-yellow-500/50 hover:text-yellow-500"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
        >
          Todos los "Creado"
        </button>
        {selected.size > 0 && (
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs px-2 py-1 rounded-lg transition-colors"
            style={{ color: 'var(--fg-muted)' }}
          >
            <X className="w-3 h-3 inline mr-0.5" />Limpiar
          </button>
        )}
      </div>

      {/* Add form / button */}
      {editing === 'new' ? (
        <InvitationForm tables={tables} onCancel={() => setEditing(null)} />
      ) : (
        <button
          onClick={() => setEditing('new')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-medium transition-colors hover:border-indigo-500/50 hover:text-indigo-500"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
        >
          <Plus className="w-4 h-4" /> Nueva invitación
        </button>
      )}

      {/* Empty / no results */}
      {invitations.length === 0 && editing !== 'new' && (
        <div className="text-center py-16" style={{ color: 'var(--fg-muted)' }}>
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay invitaciones aún.</p>
          <p className="text-xs mt-1">Haz clic en "Nueva invitación" para agregar la primera.</p>
        </div>
      )}
      {invitations.length > 0 && filtered.length === 0 && (
        <p className="text-center text-sm py-8" style={{ color: 'var(--fg-muted)' }}>
          Sin resultados para la búsqueda actual.
        </p>
      )}

      {/* List */}
      <div className="space-y-1">
        {filtered.map(inv => {
          if (editing === inv.id) {
            return (
              <InvitationForm
                key={inv.id}
                invitation={inv}
                tables={tables}
                onCancel={() => setEditing(null)}
              />
            )
          }

          const isOpen = selectedId === inv.id

          return (
            <div key={inv.id}>
              {/* Row */}
              <div
                className="flex items-center gap-3 px-3 py-3 border group transition-all"
                style={{
                  backgroundColor: selected.has(inv.id) ? 'var(--surface-2)' : 'var(--surface)',
                  borderColor: isOpen ? 'var(--accent)' : selected.has(inv.id) ? 'rgba(99,102,241,0.4)' : 'var(--border)',
                  borderRadius: isOpen ? '1rem 1rem 0 0' : '1rem',
                }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selected.has(inv.id)}
                  onChange={() => toggle(inv.id)}
                  onClick={e => e.stopPropagation()}
                  className="w-3.5 h-3.5 rounded flex-shrink-0 accent-indigo-500 cursor-pointer"
                />

                {/* Number */}
                <span
                  className="text-xs font-bold font-mono w-9 flex-shrink-0 text-right"
                  style={{ color: 'var(--fg-muted)' }}
                >
                  #{String(inv.invitationNumber ?? 0).padStart(3, '0')}
                </span>

                {/* Clickable info area */}
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left"
                  onClick={() => setSelectedId(isOpen ? null : inv.id)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--fg)' }}>
                      {inv.familyName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_META[inv.status].color}`}>
                      {STATUS_META[inv.status].label}
                    </span>
                    {inv.members.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--fg-muted)' }}>
                        <UserCheck className="w-3 h-3" />
                        {inv.members.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{inv.contactName}</span>
                    {inv.tableNumber && (
                      <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>Mesa {inv.tableNumber}</span>
                    )}
                    <span className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>
                      {inv.totalPasses} pase{inv.totalPasses > 1 ? 's' : ''}
                    </span>
                    {inv.adminNotes && (
                      <span className="text-xs italic truncate max-w-[160px]" style={{ color: 'var(--fg-muted)' }}>
                        {inv.adminNotes}
                      </span>
                    )}
                  </div>
                </button>

                {/* Hover actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    type="button"
                    title="Ver QR"
                    onClick={e => { e.stopPropagation(); setQrFor(inv) }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-indigo-500/10 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-indigo-500" />
                  </button>
                  {inv.contactPhone && (
                    <a
                      href={`https://web.whatsapp.com/send?phone=${inv.contactPhone.replace(/\D/g, '').length === 10 ? '52' + inv.contactPhone.replace(/\D/g, '') : inv.contactPhone.replace(/\D/g, '')}&text=${encodeURIComponent(`¡Hola ${inv.contactName}! 💍\n\nAquí tu invitación digital:\n\n${typeof window !== 'undefined' ? window.location.origin : ''}/i/${inv.token}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      title="WhatsApp"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-500/10 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    </a>
                  )}
                  {inv.status === 'created' && (
                    <button
                      type="button"
                      title="Marcar como enviado"
                      onClick={e => { e.stopPropagation(); handleMarkSent(inv.id) }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-500/10 transition-colors text-[10px] font-bold text-blue-500"
                    >
                      ✉
                    </button>
                  )}
                </div>

                {/* Chevron */}
                <button
                  type="button"
                  onClick={() => setSelectedId(isOpen ? null : inv.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--surface-2)] transition-colors flex-shrink-0"
                >
                  {isOpen
                    ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
                  }
                </button>
              </div>

              {/* Detail panel */}
              {isOpen && (
                <InvitationDetailPanel
                  invitation={inv}
                  tables={tables}
                  onEdit={() => { setSelectedId(null); setEditing(inv.id) }}
                  onDelete={() => handleDelete(inv.id)}
                  onQR={() => setQrFor(inv)}
                  onRevert={() => {
                    startTransition(async () => {
                      await revertCancellation(inv.id)
                      router.refresh()
                    })
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Modals */}
      {qrFor    && <QRModal invitation={qrFor} onClose={() => setQrFor(null)} />}
      {showSend && <BulkSendModal invitations={selectedRows} onClose={() => setShowSend(false)} />}
      {showMerge && selected.size >= 2 && (
        <MergeModal
          invitations={selectedRows}
          onClose={() => { setShowMerge(false); setSelected(new Set()) }}
        />
      )}

      {/* Floating action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-4 right-4 md:left-72 md:right-6 z-40 pointer-events-none">
          <div
            className="pointer-events-auto mx-auto w-fit flex items-center gap-2 px-3 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-md"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--bg) 90%, transparent)',
              borderColor: 'var(--border)',
            }}
          >
            <span className="text-sm font-semibold pr-1 pl-1" style={{ color: 'var(--fg)' }}>
              {selected.size} seleccionado{selected.size > 1 ? 's' : ''}
            </span>
            <div className="w-px h-4 opacity-20" style={{ backgroundColor: 'var(--fg)' }} />

            <button
              onClick={() => setShowSend(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enviar WhatsApp</span>
              <span className="sm:hidden">WA</span>
            </button>

            {selected.size >= 2 && (
              <button
                onClick={() => setShowMerge(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors hover:border-indigo-500/60 hover:text-indigo-500"
                style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
              >
                <Merge className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Crear familia</span>
              </button>
            )}

            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>

            <div className="w-px h-4 opacity-20" style={{ backgroundColor: 'var(--fg)' }} />
            <button
              onClick={() => setSelected(new Set())}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
