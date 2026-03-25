export const dynamic = 'force-dynamic'

import { Images } from 'lucide-react'
import { getMediaForAdmin } from '@/db/actions/media'
import MediaGallery from './_components/MediaGallery'

export default async function SocialPage() {
  const { photos, stats } = await getMediaForAdmin()

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-muted)' }}>
            Social
          </p>
          <h1 className="font-outfit font-bold text-3xl" style={{ color: 'var(--fg)' }}>Galería</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--fg-muted)' }}>
            Fotos del fotógrafo y archivos compartidos por invitados.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <Images className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold" style={{ color: 'var(--fg-muted)' }}>
            {photos.length} archivos
          </span>
        </div>
      </div>

      <MediaGallery initialPhotos={photos} stats={stats} />
    </div>
  )
}
