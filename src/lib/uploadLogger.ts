import { db } from '@/db'
import { uploadLogs } from '@/db/schema'

type Phase =
  | 'middleware_start'
  | 'middleware_ok'
  | 'middleware_error'
  | 'complete_start'
  | 'complete_db_ok'
  | 'complete_ok'
  | 'complete_error'

export async function uploadLog(params: {
  slug: string
  phase: Phase
  status?: 'ok' | 'error'
  message?: string
  details?: Record<string, unknown>
  error?: unknown
}): Promise<void> {
  try {
    const error = params.error
    let errorMsg: string | null = null
    let errorStack: string | null = null

    if (error instanceof Error) {
      errorMsg  = error.message
      errorStack = error.stack ?? null
    } else if (error !== undefined) {
      errorMsg = String(error)
    }

    await db.insert(uploadLogs).values({
      slug:       params.slug,
      phase:      params.phase,
      status:     params.status ?? (errorMsg ? 'error' : 'ok'),
      message:    params.message ?? null,
      details:    params.details ? JSON.stringify(params.details) : null,
      errorMsg,
      errorStack,
    })
  } catch (e) {
    // Never throw from the logger — log to console as fallback
    console.error('[uploadLogger] failed to write log:', e)
  }
}
