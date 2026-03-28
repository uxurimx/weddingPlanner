'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Upload, AlertCircle, CheckCircle2, FileJson, FileSpreadsheet } from 'lucide-react'
import { bulkImportInvitations, type ImportGuest } from '@/db/actions/guests'

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseCSV(text: string): ImportGuest[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []

  // Detect header row (first line that contains "nombre" case-insensitive)
  const firstLine = lines[0].toLowerCase()
  const hasHeader = firstLine.includes('nombre') || firstLine.includes('name')
  const dataLines = hasHeader ? lines.slice(1) : lines

  return dataLines.map(line => {
    // Handle quoted fields
    const fields: string[] = []
    let current = ''
    let inQuote = false
    for (const char of line) {
      if (char === '"') { inQuote = !inQuote; continue }
      if (char === ',' && !inQuote) { fields.push(current.trim()); current = ''; continue }
      current += char
    }
    fields.push(current.trim())

    const [nombre = '', telefono = '', pases = ''] = fields
    return {
      nombre:   nombre.replace(/^["']|["']$/g, ''),
      telefono: telefono.replace(/^["']|["']$/g, '') || null,
      pases:    parseInt(pases) || 1,
    }
  }).filter(g => g.nombre)
}

function parseJSON(text: string): ImportGuest[] {
  const data = JSON.parse(text)
  const arr: unknown[] = Array.isArray(data) ? data : Object.values(data).flat()
  return (arr as Record<string, unknown>[])
    .map(item => ({
      nombre:   String(item.nombre ?? item.name ?? item.contactName ?? '').trim(),
      telefono: (item.tel ?? item.telefono ?? item.phone ?? null) as string | null,
      pases:    Number(item.pases ?? item.totalPasses ?? 1) || 1,
    }))
    .filter(g => g.nombre)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImportModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<ImportGuest[] | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number } | { error: string } | null>(null)

  function handleFile(file: File) {
    setParseError(null)
    setPreview(null)
    setResult(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      try {
        const guests = file.name.endsWith('.json') ? parseJSON(text) : parseCSV(text)
        if (guests.length === 0) {
          setParseError('No se encontraron filas válidas. Verifica el formato del archivo.')
        } else {
          setPreview(guests)
        }
      } catch {
        setParseError('Error al leer el archivo. Verifica que sea un CSV o JSON válido.')
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleImport() {
    if (!preview) return
    setImporting(true)
    startTransition(async () => {
      const res = await bulkImportInvitations(preview)
      setImporting(false)
      if (res.error) {
        setResult({ error: res.error })
      } else {
        setResult({ imported: res.imported })
        router.refresh()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="font-outfit font-semibold text-lg" style={{ color: 'var(--fg)' }}>
              Importar invitados
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
              Sube un archivo CSV o JSON con los nombres y teléfonos
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Format hint */}
          <div
            className="grid grid-cols-2 gap-3 p-3 rounded-xl border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start gap-2">
              <FileSpreadsheet className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>CSV</p>
                <code className="text-[10px] text-emerald-600 block mt-0.5">nombre,telefono,pases</code>
                <code className="text-[10px]" style={{ color: 'var(--fg-muted)' }}>
                  Roberto López,(667) 123 45 67,1
                </code>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileJson className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>JSON</p>
                <code className="text-[10px] text-blue-600 block mt-0.5">
                  {'[{nombre, tel, pases}]'}
                </code>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--fg-muted)' }}>
                  Acepta arrays planos o agrupados
                </p>
              </div>
            </div>
          </div>

          {/* Drop zone */}
          {!result && (
            <div
              className="border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer"
              style={{ borderColor: 'var(--border)' }}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: 'var(--fg-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
                {fileName || 'Arrastra un archivo aquí o haz clic para seleccionar'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>CSV · JSON · máx. 1 MB</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>
          )}

          {/* Parse error */}
          {parseError && (
            <div className="flex items-start gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {parseError}
            </div>
          )}

          {/* Preview table */}
          {preview && !result && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--fg-muted)' }}>
                Vista previa — {preview.length} invitados encontrados
              </p>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                <div className="overflow-y-auto max-h-56">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--surface)' }}>
                        <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--fg-muted)' }}>#</th>
                        <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--fg-muted)' }}>Nombre</th>
                        <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--fg-muted)' }}>Teléfono</th>
                        <th className="text-right px-3 py-2 font-semibold" style={{ color: 'var(--fg-muted)' }}>Pases</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 100).map((g, i) => (
                        <tr key={i} className="border-t" style={{ borderColor: 'var(--border)' }}>
                          <td className="px-3 py-1.5 opacity-40" style={{ color: 'var(--fg)' }}>{i + 1}</td>
                          <td className="px-3 py-1.5 font-medium" style={{ color: 'var(--fg)' }}>{g.nombre}</td>
                          <td className="px-3 py-1.5" style={{ color: 'var(--fg-muted)' }}>{g.telefono ?? '—'}</td>
                          <td className="px-3 py-1.5 text-right" style={{ color: 'var(--fg-muted)' }}>{g.pases ?? 1}</td>
                        </tr>
                      ))}
                      {preview.length > 100 && (
                        <tr className="border-t" style={{ borderColor: 'var(--border)' }}>
                          <td colSpan={4} className="px-3 py-2 text-center" style={{ color: 'var(--fg-muted)' }}>
                            … y {preview.length - 100} más
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && 'imported' in result && (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <p className="font-semibold text-lg" style={{ color: 'var(--fg)' }}>
                ¡Importación exitosa!
              </p>
              <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                Se crearon <strong>{result.imported}</strong> invitaciones nuevas.
              </p>
            </div>
          )}
          {result && 'error' in result && (
            <div className="flex items-start gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {result.error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2 p-4 border-t flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            {result && 'imported' in result ? 'Cerrar' : 'Cancelar'}
          </button>
          {preview && !result && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: 'var(--fg)', color: 'var(--bg)' }}
            >
              {importing && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              Importar {preview.length} invitados
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
