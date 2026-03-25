export const dynamic = 'force-dynamic'

import { Images, MessageSquareHeart } from 'lucide-react'
import { getMediaForAdmin, getVideoMessages } from '@/db/actions/media'
import MediaGallery from './_components/MediaGallery'
import VideoMessagesList from './_components/VideoMessagesList'

export default async function SocialPage() {
  const [{ photos, stats }, videoMsgs] = await Promise.all([
    getMediaForAdmin(),
    getVideoMessages(),
  ])

  return (
    <div className="p-4 sm:p-6 max-w-4xl space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
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

      {/* Video messages section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <MessageSquareHeart className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <h2 className="font-outfit font-semibold text-lg" style={{ color: 'var(--fg)' }}>
              Mensajes para los novios
            </h2>
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
              Videos privados dejados por los invitados · {videoMsgs.length} mensaje{videoMsgs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <VideoMessagesList messages={videoMsgs} />
      </div>
    </div>
  )
}
