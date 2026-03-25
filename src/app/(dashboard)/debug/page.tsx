export const dynamic = 'force-dynamic'

import { db } from '@/db'
import { uploadLogs } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { requireRole } from '@/lib/requireRole'

export default async function DebugPage() {
  await requireRole('super_admin', 'admin')

  const logs = await db
    .select()
    .from(uploadLogs)
    .orderBy(desc(uploadLogs.createdAt))
    .limit(100)

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
          Debug
        </p>
        <h1 className="font-outfit font-bold text-3xl" style={{ color: 'var(--fg)' }}>
          Upload Logs
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--fg-muted)' }}>
          Últimos 100 registros de actividad de UploadThing — {logs.length} entradas
        </p>
      </div>

      {logs.length === 0 ? (
        <div
          className="p-8 rounded-2xl border text-center"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            Sin logs todavía. Intenta subir un archivo desde la invitación o el panel del fotógrafo.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const isError = log.status === 'error'
            const details = log.details ? (() => { try { return JSON.parse(log.details) } catch { return null } })() : null

            return (
              <div
                key={log.id}
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: isError ? 'rgba(239,68,68,0.05)' : 'var(--surface)',
                  borderColor: isError ? 'rgba(239,68,68,0.3)' : 'var(--border)',
                }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: isError ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
                        borderColor: isError ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)',
                        color: isError ? '#ef4444' : '#818cf8',
                      }}
                    >
                      {log.status?.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>
                      {log.slug ?? '—'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      {log.phase}
                    </span>
                  </div>
                  <span className="text-[10px] tabular-nums" style={{ color: 'var(--fg-muted)' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString('es-MX', {
                      month: 'short', day: '2-digit',
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                    }) : '—'}
                  </span>
                </div>

                {/* Message */}
                {log.message && (
                  <p className="text-xs mt-2" style={{ color: 'var(--fg-muted)' }}>{log.message}</p>
                )}

                {/* Details */}
                {details && (
                  <pre
                    className="text-[10px] mt-2 p-2 rounded-lg overflow-x-auto leading-relaxed"
                    style={{ backgroundColor: 'var(--bg)', color: 'var(--fg-muted)' }}
                  >
                    {JSON.stringify(details, null, 2)}
                  </pre>
                )}

                {/* Error */}
                {log.errorMsg && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold text-red-500">{log.errorMsg}</p>
                    {log.errorStack && (
                      <pre className="text-[9px] p-2 rounded-lg overflow-x-auto leading-relaxed text-red-400/70"
                        style={{ backgroundColor: 'rgba(239,68,68,0.05)' }}>
                        {log.errorStack.split('\n').slice(0, 6).join('\n')}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
