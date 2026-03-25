import type { PublicData } from '@/db/actions/public'
import type { invitations } from '@/db/schema'
import Countdown from './Countdown'
import RSVPSection from './RSVPSection'
import InvitationQR from './InvitationQR'
import AnimatedSection from './AnimatedSection'
import Link from 'next/link'

type InvitationViewProps = PublicData & {
  invitation?: typeof invitations.$inferSelect | null
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function Divider({ sm = false }: { sm?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1" style={{ backgroundColor: 'var(--w-cream-border)' }} />
      <span style={{ color: 'var(--w-gold)', fontSize: sm ? 6 : 8 }}>◆</span>
      <div className="h-px flex-1" style={{ backgroundColor: 'var(--w-cream-border)' }} />
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2 mb-5">
      <Divider />
      <p
        className="text-center text-[10px] uppercase tracking-[0.3em] font-semibold"
        style={{ color: 'var(--w-text-muted)' }}
      >
        {children}
      </p>
      <Divider />
    </div>
  )
}

function formatTime(date: Date | null) {
  if (!date) return null
  return date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true })
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroSection({ couple, event }: { couple: InvitationViewProps['couple']; event: InvitationViewProps['event'] }) {
  const groomName = couple?.groomName || 'Jahir'
  const brideName = couple?.brideName || 'Gilliane'

  return (
    <section className="text-center space-y-5 pt-6 pb-4">
      <p
        className="text-[10px] uppercase tracking-[0.35em]"
        style={{ color: 'var(--w-text-muted)' }}
      >
        Con mucho amor, los invitan a celebrar su boda
      </p>

      <div className="space-y-1">
        <h1
          className="font-outfit text-5xl sm:text-6xl font-bold leading-tight"
          style={{ color: 'var(--w-text)' }}
        >
          {groomName}
        </h1>
        <p
          className="font-outfit text-2xl"
          style={{ color: 'var(--w-gold)' }}
        >
          &amp;
        </p>
        <h1
          className="font-outfit text-5xl sm:text-6xl font-bold leading-tight"
          style={{ color: 'var(--w-text)' }}
        >
          {brideName}
        </h1>
      </div>

      <Divider />

      <div className="space-y-1.5">
        <p
          className="text-sm uppercase tracking-[0.2em]"
          style={{ color: 'var(--w-text-muted)' }}
        >
          Sábado · 6 de Junio · 2026
        </p>
        <p
          className="text-xs"
          style={{ color: 'var(--w-text-light)' }}
        >
          Culiacán, Sinaloa · México
        </p>
      </div>
    </section>
  )
}

function QuoteSection({ couple }: { couple: InvitationViewProps['couple'] }) {
  if (!couple?.quote) return null
  return (
    <section className="text-center space-y-4 py-2">
      <Divider sm />
      <div className="px-4">
        <p
          className="text-sm italic leading-relaxed"
          style={{ color: 'var(--w-text)' }}
        >
          &ldquo;{couple.quote}&rdquo;
        </p>
        {couple.quoteSource && (
          <p
            className="text-[10px] uppercase tracking-widest mt-3"
            style={{ color: 'var(--w-gold)' }}
          >
            — {couple.quoteSource}
          </p>
        )}
      </div>
      <Divider sm />
    </section>
  )
}

function ParentsSection({ couple }: { couple: InvitationViewProps['couple'] }) {
  if (!couple?.groomFather && !couple?.groomMother && !couple?.brideFather && !couple?.brideMother) return null
  return (
    <section className="text-center space-y-3">
      <p
        className="text-[10px] uppercase tracking-[0.25em]"
        style={{ color: 'var(--w-text-light)' }}
      >
        Hijos de
      </p>
      <div className="grid grid-cols-2 gap-4">
        {(couple.groomFather || couple.groomMother) && (
          <div className="space-y-0.5">
            {couple.groomFather && (
              <p className="text-xs font-medium" style={{ color: 'var(--w-text)' }}>{couple.groomFather}</p>
            )}
            {couple.groomMother && (
              <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>& {couple.groomMother}</p>
            )}
          </div>
        )}
        {(couple.brideFather || couple.brideMother) && (
          <div className="space-y-0.5">
            {couple.brideFather && (
              <p className="text-xs font-medium" style={{ color: 'var(--w-text)' }}>{couple.brideFather}</p>
            )}
            {couple.brideMother && (
              <p className="text-xs" style={{ color: 'var(--w-text-muted)' }}>& {couple.brideMother}</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function InvitationTextSection({ couple }: { couple: InvitationViewProps['couple'] }) {
  if (!couple?.invitationText) return null
  return (
    <section className="text-center">
      <p
        className="text-sm leading-relaxed whitespace-pre-line"
        style={{ color: 'var(--w-text-muted)' }}
      >
        {couple.invitationText}
      </p>
    </section>
  )
}

function VenueCard({ venue }: { venue: InvitationViewProps['venues'][number] }) {
  const isReception = venue.type === 'reception'
  const emoji = isReception ? '🥂' : '⛪'
  const label = isReception ? 'Recepción' : 'Ceremonia'
  const timeStr = formatTime(venue.startTime)

  return (
    <div
      className="rounded-2xl border p-5 space-y-3"
      style={{ backgroundColor: 'white', borderColor: 'var(--w-cream-border)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className="text-[9px] uppercase tracking-[0.2em] font-bold"
            style={{ color: 'var(--w-text-light)' }}
          >
            {label}
          </span>
          <p
            className="text-sm font-semibold font-outfit mt-0.5"
            style={{ color: 'var(--w-text)' }}
          >
            {venue.name}
          </p>
        </div>
        <span className="text-2xl flex-shrink-0">{emoji}</span>
      </div>

      {timeStr && (
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--w-blue)' }}
        >
          {timeStr}
        </p>
      )}

      {venue.address && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--w-text-muted)' }}>
          {venue.address}
          {venue.city ? `, ${venue.city}` : ''}
        </p>
      )}

      {(venue.googleMapsUrl || venue.wazeUrl) && (
        <div className="flex gap-2 pt-1">
          {venue.googleMapsUrl && (
            <a
              href={venue.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs font-medium py-2 rounded-xl border transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--w-blue-border)',
                color: 'var(--w-blue)',
                backgroundColor: 'var(--w-blue-border)',
              }}
            >
              Google Maps
            </a>
          )}
          {venue.wazeUrl && (
            <a
              href={venue.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs font-medium py-2 rounded-xl border transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--w-cream-border)',
                color: 'var(--w-text-muted)',
                backgroundColor: 'transparent',
              }}
            >
              Waze
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function VenuesSection({ venues }: { venues: InvitationViewProps['venues'] }) {
  if (venues.length === 0) return null
  return (
    <section className="space-y-4">
      <SectionHeader>Celebración</SectionHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {venues.map(v => <VenueCard key={v.id} venue={v} />)}
      </div>
    </section>
  )
}

function ItinerarySection({ itinerary }: { itinerary: InvitationViewProps['itinerary'] }) {
  if (itinerary.length === 0) return null
  return (
    <section>
      <SectionHeader>Programa del Evento</SectionHeader>
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-[30px] top-3 bottom-3 w-px"
          style={{ backgroundColor: 'var(--w-cream-border)' }}
        />
        <div className="space-y-0">
          {itinerary.map((item, i) => (
            <div key={item.id} className="flex gap-4 py-3 relative">
              {/* Icon bubble */}
              <div
                className="w-[60px] h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm z-10 border"
                style={{ backgroundColor: 'var(--w-cream-dark)', borderColor: 'var(--w-cream-border)' }}
              >
                {item.icon || '📌'}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--w-blue)' }}
                  >
                    {item.time}
                  </span>
                  <span
                    className="text-sm font-semibold font-outfit"
                    style={{ color: 'var(--w-text)' }}
                  >
                    {item.title}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--w-text-muted)' }}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function NotesSection({ event }: { event: InvitationViewProps['event'] }) {
  if (!event.dressCode && !event.eventNotes) return null
  return (
    <section className="space-y-3">
      {event.dressCode && (
        <div
          className="p-4 rounded-2xl border text-center"
          style={{ backgroundColor: 'white', borderColor: 'var(--w-cream-border)' }}
        >
          <p className="text-[9px] uppercase tracking-[0.25em] mb-1" style={{ color: 'var(--w-text-light)' }}>
            Código de vestimenta
          </p>
          <p className="text-sm font-semibold" style={{ color: 'var(--w-text)' }}>
            {event.dressCode}
          </p>
          {event.dressCodeNotes && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--w-text-muted)' }}>
              {event.dressCodeNotes}
            </p>
          )}
        </div>
      )}
      {event.eventNotes && (
        <div
          className="p-4 rounded-2xl border"
          style={{ backgroundColor: 'white', borderColor: 'var(--w-cream-border)' }}
        >
          <p className="text-xs leading-relaxed text-center" style={{ color: 'var(--w-text-muted)' }}>
            {event.eventNotes}
          </p>
        </div>
      )}
    </section>
  )
}

const GIFT_LABELS: Record<string, { label: string; emoji: string }> = {
  registry:      { label: 'Tienda',      emoji: '🏬' },
  bank_transfer: { label: 'Transferencia', emoji: '🏦' },
  honeymoon:     { label: 'Luna de miel', emoji: '✈️' },
  other:         { label: 'Regalo',       emoji: '🎁' },
}

function GiftCard({ gift }: { gift: InvitationViewProps['gifts'][number] }) {
  const meta = GIFT_LABELS[gift.type] ?? GIFT_LABELS.other
  return (
    <div
      className="p-4 rounded-2xl border space-y-2"
      style={{ backgroundColor: 'white', borderColor: 'var(--w-cream-border)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{meta.emoji}</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--w-text)' }}>
            {gift.storeName ?? gift.bankName ?? meta.label}
          </p>
          <p className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--w-text-light)' }}>
            {meta.label}
          </p>
        </div>
      </div>
      <div className="space-y-0.5 text-xs" style={{ color: 'var(--w-text-muted)' }}>
        {gift.listNumber    && <p>Lista <span className="font-semibold" style={{ color: 'var(--w-text)' }}>#{gift.listNumber}</span></p>}
        {gift.accountHolder && <p>Titular <span className="font-medium" style={{ color: 'var(--w-text)' }}>{gift.accountHolder}</span></p>}
        {gift.accountNumber && <p className="font-mono">{gift.accountNumber}</p>}
        {gift.clabe         && <p>CLABE <span className="font-mono">{gift.clabe}</span></p>}
        {gift.description   && <p className="italic">{gift.description}</p>}
        {gift.url && (
          <a href={gift.url} target="_blank" rel="noopener noreferrer"
            className="block truncate hover:opacity-70 transition-opacity"
            style={{ color: 'var(--w-blue)' }}>
            {gift.url}
          </a>
        )}
      </div>
    </div>
  )
}

function SpotifySection({ couple }: { couple: InvitationViewProps['couple'] }) {
  const url = couple?.songUrl
  if (!url) return null

  // Extract Spotify track/album/playlist ID from URL
  // Handles: open.spotify.com/track/ID, open.spotify.com/intl-*/track/ID
  const m = url.match(/spotify\.com(?:\/intl-[^/]+)?\/(\w+)\/([A-Za-z0-9]+)/)
  if (!m) return null
  const [, type, id] = m
  const embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`

  return (
    <section className="space-y-3">
      <SectionHeader>Nuestra Canción</SectionHeader>
      {couple?.songTitle && (
        <p className="text-center text-xs italic" style={{ color: 'var(--w-text-muted)' }}>
          {couple.songTitle}
        </p>
      )}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--w-cream-border)' }}>
        <iframe
          src={embedUrl}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ border: 'none', display: 'block' }}
          title={couple?.songTitle ?? 'Nuestra canción'}
        />
      </div>
    </section>
  )
}

function GiftsSection({ gifts }: { gifts: InvitationViewProps['gifts'] }) {
  if (gifts.length === 0) return null
  return (
    <section className="space-y-4">
      <SectionHeader>Mesa de Regalos</SectionHeader>
      <div
        className="p-3 rounded-2xl border text-center"
        style={{ backgroundColor: 'white', borderColor: 'var(--w-gold-light)' }}
      >
        <p className="text-xs italic leading-relaxed" style={{ color: 'var(--w-text-muted)' }}>
          Tu presencia es nuestro mejor regalo, pero si deseas añadir algo más:
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {gifts.map(g => <GiftCard key={g.id} gift={g} />)}
      </div>
    </section>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function InvitationView({
  event,
  couple,
  venues,
  itinerary,
  gifts,
  invitation,
}: InvitationViewProps) {
  const weddingDate = event.date.toISOString()

  return (
    <div
      className="max-w-lg mx-auto px-6 py-12 space-y-12"
      style={{ color: 'var(--w-text)' }}
    >
      {/* Personalized header */}
      {invitation && (
        <AnimatedSection>
          <div
            className="text-center py-6 rounded-3xl border"
            style={{ backgroundColor: 'white', borderColor: 'var(--w-cream-border)' }}
          >
            <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--w-text-light)' }}>
              Esta invitación es para
            </p>
            <p className="font-outfit text-2xl font-bold" style={{ color: 'var(--w-text)' }}>
              {invitation.familyName}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--w-text-muted)' }}>
              {invitation.contactName} · {invitation.totalPasses} pase{invitation.totalPasses > 1 ? 's' : ''}
            </p>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection delay={0.05}>
        <HeroSection couple={couple} event={event} />
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <Countdown weddingDate={weddingDate} />
      </AnimatedSection>

      <AnimatedSection>
        <QuoteSection couple={couple} />
      </AnimatedSection>

      <AnimatedSection>
        <ParentsSection couple={couple} />
      </AnimatedSection>

      <AnimatedSection>
        <InvitationTextSection couple={couple} />
      </AnimatedSection>

      <AnimatedSection>
        <VenuesSection venues={venues} />
      </AnimatedSection>

      <AnimatedSection>
        <ItinerarySection itinerary={itinerary} />
      </AnimatedSection>

      <AnimatedSection>
        <NotesSection event={event} />
      </AnimatedSection>

      <AnimatedSection>
        <SpotifySection couple={couple} />
      </AnimatedSection>

      <AnimatedSection>
        <GiftsSection gifts={gifts} />
      </AnimatedSection>

      {/* QR — shown only when there's a personalized invitation */}
      {invitation && invitation.status !== 'present' && (
        <AnimatedSection>
          <section className="space-y-3">
            <SectionHeader>Tu Código QR</SectionHeader>
            <InvitationQR token={invitation.token} />
          </section>
        </AnimatedSection>
      )}

      {/* RSVP */}
      {invitation && !['present'].includes(invitation.status) && (
        <AnimatedSection>
          <RSVPSection
            token={invitation.token}
            familyName={invitation.familyName}
            totalPasses={invitation.totalPasses}
            currentStatus={invitation.status}
            confirmedCount={invitation.confirmedCount}
          />
        </AnimatedSection>
      )}

      {/* Post-event: shown when guest is already checked in */}
      {invitation && invitation.status === 'present' && (
        <AnimatedSection>
          <section className="space-y-3">
            <SectionHeader>Después del Evento</SectionHeader>
            <div
              className="p-5 rounded-2xl border text-center space-y-3"
              style={{ backgroundColor: 'white', borderColor: 'var(--w-cream-border)' }}
            >
              <p className="text-2xl">📸</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--w-text)' }}>
                ¡Gracias por acompañarnos!
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--w-text-muted)' }}>
                Comparte tus fotos y videos del evento con los novios.
              </p>
              <Link
                href={`/r/${invitation.token}`}
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--w-blue)' }}
              >
                Subir fotos y videos →
              </Link>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Footer */}
      <AnimatedSection>
        <footer className="text-center pb-4 space-y-4">
          <Divider />
          <p
            className="font-outfit text-xl font-semibold tracking-wide"
            style={{ color: 'var(--w-gold)' }}
          >
            J &amp; G
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--w-text-light)' }}>
            Te esperamos con mucho amor · 06·06·2026
          </p>
          <Divider />
        </footer>
      </AnimatedSection>
    </div>
  )
}
