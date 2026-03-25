export const dynamic = 'force-dynamic'

import { Camera } from 'lucide-react'
import { getPhotographerData } from '@/db/actions/media'
import PhotographerManager from './_components/PhotographerManager'

export default async function PhotographerPage() {
  const data = await getPhotographerData()

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
            Social
          </p>
          <h1 className="font-outfit font-bold text-3xl" style={{ color: 'var(--fg)' }}>Fotógrafo</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--fg-muted)' }}>
            Link tokenizado para subida de fotos oficiales sin cuenta.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <Camera className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold" style={{ color: 'var(--fg-muted)' }}>
            {data.uploadCount} fotos
          </span>
        </div>
      </div>

      <PhotographerManager
        photographerToken={data.photographerToken}
        uploadCount={data.uploadCount}
      />
    </div>
  )
}
