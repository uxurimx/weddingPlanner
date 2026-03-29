'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, QrCode, Pencil, Trash2, MessageCircle, FileDown,
  Search, X, Users, FileUp, Send, Merge,
} from 'lucide-react'
import {
  deleteInvitation,
  markInvitationSent,
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
      setSelected(prev => {
        const next = new Set(prev)
        filtered.forEach(i => next.delete(i.id))
        return next
      })
    } else {
      setSelected(prev => new Set([...prev, ...filtered.map(i => i.id)]))
    }
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAllCreated() {
    const ids = invitations.filter(i => i.status === 'created').map(i => i.id)
    setSelected(new Set(ids))
  }

  // ─── Actions ──────────────────────────────────────────────────────────────
  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta invitación?')) return
    startTransition(async () => { await deleteInvitation(id); router.refresh() })
  }

  function handleMarkSent(id: string) {
    startTransition(async () => { await markInvitationSent(id); router.refresh() })
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
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar familia, contacto, #..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border text-sm focus:outline-none transition-colors"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted)' }} />
            </button>
          )}
        </div>

        {/* Status filter */}
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

        {/* Table filter */}
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

        {/* CSV export */}
        <button
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors hover:border-indigo-500/50"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
        >
          <FileDown className="w-3.5 h-3.5" /> CSV
        </button>

        {/* Import */}
        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors hover:border-emerald-500/50 hover:text-emerald-500"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
        >
          <FileUp className="w-3.5 h-3.5" /> Importar
        </button>
      </div>

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      {/* Bulk selection bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Select all visible / all created shortcuts */}
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

      {/* Floating action bar — appears when items are selected */}
      {selected.size > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 p-3 rounded-2xl border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <span className="text-sm font-semibold flex-1" style={{ color: 'var(--fg)' }}>
            {selected.size} seleccionado{selected.size > 1 ? 's' : ''}
          </span>
          {/* Bulk WhatsApp send */}
          <button
            onClick={() => setShowSend(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Enviar por WhatsApp
          </button>
          {/* Merge / create family */}
          {selected.size >= 2 && (
            <button
              onClick={() => setShowMerge(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors hover:border-indigo-500/60 hover:text-indigo-500"
              style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
            >
              <Merge className="w-3.5 h-3.5" /> Crear familia
            </button>
          )}
        </div>
      )}

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

      {/* Empty state */}
      {invitations.length === 0 && editing !== 'new' && (
        <div className="text-center py-16" style={{ color: 'var(--fg-muted)' }}>
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay invitaciones aún.</p>
          <p className="text-xs mt-1">Haz clic en "Nueva invitación" para agregar la primera.</p>
        </div>
      )}

      {/* No results */}
      {invitations.length > 0 && filtered.length === 0 && (
        <p className="text-center text-sm py-8" style={{ color: 'var(--fg-muted)' }}>
          Sin resultados para la búsqueda actual.
        </p>
      )}

      {/* List */}
      <div className="space-y-2">
        {filtered.map(inv => (
          editing === inv.id ? (
            <InvitationForm
              key={inv.id}
              invitation={inv}
              tables={tables}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div
              key={inv.id}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl border group transition-colors ${selected.has(inv.id) ? 'border-indigo-500/40' : ''}`}
              style={{
                backgroundColor: selected.has(inv.id) ? 'var(--surface-2, var(--surface))' : 'var(--surface)',
                borderColor: selected.has(inv.id) ? undefined : 'var(--border)',
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.has(inv.id)}
                onChange={() => toggle(inv.id)}
                className="w-3.5 h-3.5 rounded flex-shrink-0 accent-indigo-500 cursor-pointer"
              />

              {/* Number */}
              <span
                className="text-xs font-bold font-mono w-9 flex-shrink-0 text-right"
                style={{ color: 'var(--fg-muted)' }}
              >
                #{String(inv.invitationNumber ?? 0).padStart(3, '0')}
              </span>

              {/* Names */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold truncate" style={{ color: 'var(--fg)' }}>
                    {inv.familyName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_META[inv.status].color}`}
                  >
                    {STATUS_META[inv.status].label}
                  </span>
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
                    <span className="text-xs italic truncate max-w-[180px]" style={{ color: 'var(--fg-muted)' }}>
                      {inv.adminNotes}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions (hover) */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  type="button"
                  title="Ver QR"
                  onClick={() => setQrFor(inv)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-500/10 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-indigo-500" />
                </button>
                {inv.contactPhone && (
                  <a
                    href={`https://web.whatsapp.com/send?phone=${inv.contactPhone.replace(/\D/g, '').length === 10 ? '52' + inv.contactPhone.replace(/\D/g, '') : inv.contactPhone.replace(/\D/g, '')}&text=${encodeURIComponent(`¡Hola ${inv.contactName}! 💍\n\nAquí tu invitación digital:\n\n${typeof window !== 'undefined' ? window.location.origin : ''}/i/${inv.token}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-500/10 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  </a>
                )}
                {inv.status === 'created' && (
                  <button
                    type="button"
                    title="Marcar como enviado"
                    onClick={() => handleMarkSent(inv.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-500/10 transition-colors text-[10px] font-bold text-blue-500"
                  >
                    ✉
                  </button>
                )}
                <button
                  type="button"
                  title="Editar"
                  onClick={() => setEditing(inv.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-500/10 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-indigo-500" />
                </button>
                <button
                  type="button"
                  title="Eliminar"
                  onClick={() => handleDelete(inv.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
          )
        ))}
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
    </div>
  )
}
