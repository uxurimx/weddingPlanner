import type { PublicData } from '@/db/actions/public'
import type { invitations } from '@/db/schema'
import AnimatedSection from './AnimatedSection'
import PresentView from './PresentView'
import RSVPSection from './RSVPSection'
import GuestCard from './GuestCard'
import Countdown from './Countdown'

type Props = PublicData & { invitation?: typeof invitations.$inferSelect | null }

// ─── SVG Decorations ──────────────────────────────────────────────────────────

function BouquetSVG() {
  return (
    <svg
      viewBox="0 0 120 130"
      style={{ color: 'var(--w-blue)', width: 110, height: 120, display: 'block', margin: '0 auto' }}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Center rose */}
      <circle cx="60" cy="30" r="13" strokeWidth="1.1" />
      <circle cx="60" cy="30" r="6" strokeWidth="0.7" />
      {/* Petals of center rose */}
      <circle cx="60" cy="15" r="5" strokeWidth="0.7" />
      <circle cx="73" cy="19" r="5" strokeWidth="0.7" />
      <circle cx="73" cy="41" r="5" strokeWidth="0.7" />
      <circle cx="60" cy="45" r="5" strokeWidth="0.7" />
      <circle cx="47" cy="41" r="5" strokeWidth="0.7" />
      <circle cx="47" cy="19" r="5" strokeWidth="0.7" />
      {/* Left flower */}
      <circle cx="31" cy="50" r="10" strokeWidth="1" />
      <circle cx="31" cy="50" r="4" strokeWidth="0.7" />
      {/* Right flower */}
      <circle cx="89" cy="50" r="10" strokeWidth="1" />
      <circle cx="89" cy="50" r="4" strokeWidth="0.7" />
      {/* Left small bud */}
      <ellipse cx="17" cy="62" rx="6" ry="8" strokeWidth="0.8" />
      {/* Right small bud */}
      <ellipse cx="103" cy="62" rx="6" ry="8" strokeWidth="0.8" />
      {/* Leaves - filled */}
      <path d="M39,64 Q25,55 27,68 Q36,64 39,64Z" fill="currentColor" strokeWidth="0" opacity="0.85" />
      <path d="M81,64 Q95,55 93,68 Q84,64 81,64Z" fill="currentColor" strokeWidth="0" opacity="0.85" />
      <path d="M46,70 Q33,62 35,74 Q44,70 46,70Z" fill="currentColor" strokeWidth="0" opacity="0.75" />
      <path d="M74,70 Q87,62 85,74 Q76,70 74,70Z" fill="currentColor" strokeWidth="0" opacity="0.75" />
      {/* Stems */}
      <path d="M60,43 L60,90" strokeWidth="1.2" />
      <path d="M31,60 Q44,74 55,89" strokeWidth="1" />
      <path d="M89,60 Q76,74 65,89" strokeWidth="1" />
      <path d="M17,70 Q36,78 52,89" strokeWidth="0.8" />
      <path d="M103,70 Q84,78 68,89" strokeWidth="0.8" />
      {/* Ribbon tie */}
      <path d="M47,89 Q60,98 73,89" strokeWidth="1.3" />
      {/* Left bow loop */}
      <path d="M47,89 Q36,81 38,93 Q45,91 47,89" strokeWidth="1" />
      {/* Right bow loop */}
      <path d="M73,89 Q84,81 82,93 Q75,91 73,89" strokeWidth="1" />
      {/* Ribbon tail stems */}
      <path d="M43,95 L38,110" strokeWidth="0.9" />
      <path d="M60,97 L60,112" strokeWidth="0.9" />
      <path d="M77,95 L82,110" strokeWidth="0.9" />
    </svg>
  )
}

function OrnamentDivider() {
  return (
    <div style={{ color: 'var(--w-blue)', padding: '8px 0' }}>
      <svg
        viewBox="0 0 280 24"
        style={{ width: '100%', maxWidth: 300, display: 'block', margin: '0 auto' }}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      >
        {/* Left wave */}
        <path d="M4,12 Q12,6 20,12 Q28,18 36,12 Q44,6 52,12" strokeWidth="0.9" />
        {/* Left line */}
        <line x1="53" y1="12" x2="96" y2="12" strokeWidth="0.6" />
        {/* Left small flower */}
        <circle cx="100" cy="12" r="2" strokeWidth="0.7" />
        {/* Center diamond */}
        <path d="M128,5 L140,12 L128,19 L116,12 Z" strokeWidth="0.9" />
        {/* Right small flower */}
        <circle cx="180" cy="12" r="2" strokeWidth="0.7" />
        {/* Right line */}
        <line x1="184" y1="12" x2="227" y2="12" strokeWidth="0.6" />
        {/* Right wave */}
        <path d="M228,12 Q236,6 244,12 Q252,18 260,12 Q268,6 276,12" strokeWidth="0.9" />
      </svg>
    </div>
  )
}

function SimpleWave() {
  return (
    <div style={{ color: 'var(--w-blue)', textAlign: 'center', padding: '4px 0' }}>
      <svg
        viewBox="0 0 80 16"
        style={{ width: 80, height: 16, display: 'inline-block' }}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      >
        <path d="M4,8 Q12,3 20,8 Q28,13 36,8 Q44,3 52,8 Q60,13 68,8 Q74,5 76,8" strokeWidth="1" />
      </svg>
    </div>
  )
}

function CornerOrnamentBox({ children }: { children: React.ReactNode }) {
  const corner = (
    <svg viewBox="0 0 36 36" style={{ width: 36, height: 36 }} fill="none" stroke="currentColor" strokeLinecap="round">
      <path d="M4,18 Q4,4 18,4" strokeWidth="1" />
      <path d="M7,18 Q7,7 18,7" strokeWidth="0.7" />
      <circle cx="5" cy="5" r="2" fill="currentColor" strokeWidth="0" />
    </svg>
  )
  return (
    <div style={{ position: 'relative', padding: '20px 16px', color: 'var(--w-blue)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0 }}>{corner}</div>
      <div style={{ position: 'absolute', top: 0, right: 0, transform: 'scaleX(-1)' }}>{corner}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'scaleY(-1)' }}>{corner}</div>
      <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'scale(-1)' }}>{corner}</div>
      {children}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatEventDate(date: Date): string {
  return date
    .toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(/^\w/, c => c.toUpperCase())
    .replace(' de ', ' ')
    .replace(' de ', ' ')
}

function formatTime(date: Date | null): string | null {
  if (!date) return null
  return date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true })
}

// ─── Venue Chip ───────────────────────────────────────────────────────────────

function VenueChip({ venue }: { venue: Props['venues'][number] }) {
  const time = formatTime(venue.startTime)
  const sectionTitle = venue.type === 'ceremony' ? 'Discurso Bíblico' : 'Recepción'

  return (
    <div className="text-center space-y-3">
      <p style={{ fontFamily: 'var(--font-dancing)', fontSize: '2.2rem', color: 'var(--w-blue)', lineHeight: 1.1 }}>
        {sectionTitle}
      </p>
      {time && (
        <p style={{ fontSize: '1rem', color: 'var(--w-text)', fontStyle: 'italic' }}>
          {time}.
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'stretch',
            borderRadius: 999,
            border: '1px solid var(--w-blue-border)',
            overflow: 'hidden',
            maxWidth: '100%',
          }}
        >
          <span
            style={{
              padding: '6px 14px',
              fontSize: '0.72rem',
              color: 'var(--w-text)',
              backgroundColor: 'white',
              maxWidth: 160,
              textAlign: 'center',
              lineHeight: 1.3,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {venue.name}
          </span>
          {venue.address && (
            <span
              style={{
                padding: '6px 12px',
                fontSize: '0.72rem',
                color: 'var(--w-text-muted)',
                backgroundColor: 'var(--w-blue-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                maxWidth: 160,
                lineHeight: 1.3,
              }}
            >
              <span>📍</span>
              <span>
                {venue.address}
                {venue.city ? `, ${venue.city}` : ''}
              </span>
            </span>
          )}
        </div>
      </div>
      {(venue.googleMapsUrl || venue.wazeUrl) && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {venue.googleMapsUrl && (
            <a
              href={venue.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.7rem', color: 'var(--w-blue)', textDecoration: 'underline' }}
            >
              Google Maps
            </a>
          )}
          {venue.wazeUrl && (
            <a
              href={venue.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.7rem', color: 'var(--w-blue)', textDecoration: 'underline' }}
            >
              Waze
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function InvitationView({ event, couple, venues, itinerary, gifts, invitation }: Props) {
  // Checked-in guests see the present view
  if (invitation?.status === 'present') {
    return <PresentView invitation={invitation} event={event} itinerary={itinerary} couple={couple} />
  }

  const groomName = couple?.groomName || 'Jahir'
  const brideName = couple?.brideName || 'Gilliane'
  const eventDateStr = formatEventDate(event.date)
  const weddingDate = event.date.toISOString()

  const ceremony  = venues.find(v => v.type === 'ceremony')
  const reception = venues.find(v => v.type === 'reception')

  const giftRegistries = gifts.filter(g => g.type === 'registry')
  const bankTransfers  = gifts.filter(g => g.type === 'bank_transfer')

  return (
    <div style={{ backgroundColor: 'var(--w-cream)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 40px' }}>

        <CornerOrnamentBox>

          {/* HERO */}
          <AnimatedSection>
            <div style={{ textAlign: 'center', paddingTop: 12, paddingBottom: 8 }}>
              <p
                style={{
                  fontFamily: 'var(--font-dancing)',
                  fontSize: '1.3rem',
                  color: 'var(--w-blue)',
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                Join us for the Wedding of
              </p>

              <BouquetSVG />

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', marginTop: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--w-blue)', fontStyle: 'italic' }}>
                  {groomName}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--w-blue)', fontStyle: 'italic' }}>
                  06. 2026
                </span>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-script)',
                  fontSize: '3rem',
                  color: 'var(--w-blue)',
                  lineHeight: 1.15,
                  marginTop: 4,
                }}
              >
                {brideName} + {groomName}
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection><OrnamentDivider /></AnimatedSection>

          {/* COUNTDOWN */}
          <AnimatedSection>
            <div style={{ padding: '4px 0' }}>
              <Countdown weddingDate={weddingDate} />
            </div>
          </AnimatedSection>

          <AnimatedSection><OrnamentDivider /></AnimatedSection>

          {/* GUEST CARD */}
          {invitation && (
            <AnimatedSection>
              <div
                style={{
                  border: '1px solid var(--w-blue-border)',
                  borderRadius: 16,
                  backgroundColor: 'white',
                  margin: '4px 0',
                }}
              >
                <GuestCard
                  familyName={invitation.familyName}
                  contactName={invitation.contactName}
                  totalPasses={invitation.totalPasses}
                  token={invitation.token}
                  status={invitation.status}
                />
              </div>
            </AnimatedSection>
          )}

          {invitation && <AnimatedSection><OrnamentDivider /></AnimatedSection>}

          {/* NOS COMPLACE */}
          <AnimatedSection>
            <div style={{ textAlign: 'center', padding: '8px 8px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-dancing)',
                  fontSize: '1.7rem',
                  color: 'var(--w-blue)',
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                Nos complace que seas parte<br />de este día tan especial.
              </p>
              {couple?.quote && (
                <>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--w-text-muted)',
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      marginBottom: 6,
                    }}
                  >
                    &ldquo;{couple.quote}&rdquo;
                  </p>
                  {couple.quoteSource && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--w-text-light)' }}>
                      ({couple.quoteSource})
                    </p>
                  )}
                </>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection><OrnamentDivider /></AnimatedSection>

          {/* PARENTS */}
          {(couple?.groomFather || couple?.groomMother || couple?.brideFather || couple?.brideMother) && (
            <AnimatedSection>
              <div style={{ textAlign: 'center', padding: '4px 0' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-dancing)',
                    fontSize: '1.6rem',
                    color: 'var(--w-blue)',
                    marginBottom: 12,
                  }}
                >
                  En compañía de nuestros Padres:
                </p>
                <SimpleWave />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                  {(couple.groomFather || couple.groomMother) && (
                    <div style={{ textAlign: 'center' }}>
                      {couple.groomFather && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--w-text)', fontWeight: 500 }}>
                          {couple.groomFather}
                        </p>
                      )}
                      {couple.groomMother && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--w-text-muted)' }}>
                          {couple.groomMother}
                        </p>
                      )}
                    </div>
                  )}
                  {(couple.brideFather || couple.brideMother) && (
                    <div style={{ textAlign: 'center' }}>
                      {couple.brideFather && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--w-text)', fontWeight: 500 }}>
                          {couple.brideFather}
                        </p>
                      )}
                      {couple.brideMother && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--w-text-muted)' }}>
                          {couple.brideMother}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection><OrnamentDivider /></AnimatedSection>

          {/* DATE */}
          <AnimatedSection>
            <div style={{ textAlign: 'center', padding: '4px 0' }}>
              <p
                style={{
                  fontFamily: 'var(--font-dancing)',
                  fontSize: '2.2rem',
                  color: 'var(--w-blue)',
                  lineHeight: 1.2,
                }}
              >
                {eventDateStr}
              </p>
              <SimpleWave />
            </div>
          </AnimatedSection>

          {/* VENUES */}
          {ceremony && (
            <AnimatedSection>
              <div style={{ padding: '8px 0' }}>
                <VenueChip venue={ceremony} />
              </div>
            </AnimatedSection>
          )}

          {ceremony && reception && <AnimatedSection><OrnamentDivider /></AnimatedSection>}

          {reception && (
            <AnimatedSection>
              <div style={{ padding: '8px 0' }}>
                <VenueChip venue={reception} />
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection><OrnamentDivider /></AnimatedSection>

          {/* PASSES */}
          {invitation && (
            <AnimatedSection>
              <div style={{ textAlign: 'center', padding: '4px 0' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-dancing)',
                    fontSize: '1.7rem',
                    color: 'var(--w-blue)',
                    marginBottom: 16,
                  }}
                >
                  Hemos reservado para ti:
                </p>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    border: '1.5px solid var(--w-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-dancing)',
                      fontSize: '2.2rem',
                      color: 'var(--w-blue)',
                      lineHeight: 1,
                    }}
                  >
                    {invitation.totalPasses}
                  </span>
                </div>
                {event.eventNotes && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--w-text-muted)', fontStyle: 'italic' }}>
                    {event.eventNotes}
                  </p>
                )}
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection><OrnamentDivider /></AnimatedSection>

          {/* GIFTS */}
          {gifts.length > 0 && (
            <AnimatedSection>
              <div style={{ textAlign: 'center', padding: '4px 0' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-dancing)',
                    fontSize: '1.5rem',
                    color: 'var(--w-blue)',
                    lineHeight: 1.3,
                    marginBottom: 16,
                  }}
                >
                  Tu presencia es nuestro mejor regalo,<br />pero si deseas añadir algo más:
                </p>

                {giftRegistries.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--w-blue-dark)',
                        marginBottom: 8,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>🎁</span> Mesa de regalos
                    </p>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: giftRegistries.length > 1 ? '1fr 1fr' : '1fr',
                        gap: 8,
                      }}
                    >
                      {giftRegistries.map(g => (
                        <div key={g.id} style={{ textAlign: 'center', fontSize: '0.78rem' }}>
                          <p style={{ fontWeight: 600, color: 'var(--w-text)' }}>{g.storeName}</p>
                          {g.listNumber && (
                            <p style={{ color: 'var(--w-text-muted)' }}>No. {g.listNumber}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bankTransfers.length > 0 && (
                  <div>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--w-blue-dark)',
                        marginBottom: 8,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>💳</span> Efectivo o Transferencia
                    </p>
                    {bankTransfers.map(g => (
                      <div key={g.id} style={{ textAlign: 'center', fontSize: '0.78rem', marginBottom: 6 }}>
                        {g.accountHolder && (
                          <p style={{ fontWeight: 500, color: 'var(--w-text)' }}>{g.accountHolder}</p>
                        )}
                        {g.bankName && (
                          <p style={{ color: 'var(--w-text-muted)' }}>{g.bankName}</p>
                        )}
                        {g.accountNumber && (
                          <p style={{ fontFamily: 'monospace', color: 'var(--w-text)', letterSpacing: '0.04em' }}>
                            {g.accountNumber}
                          </p>
                        )}
                        {g.clabe && (
                          <p style={{ fontFamily: 'monospace', color: 'var(--w-text-muted)', fontSize: '0.7rem' }}>
                            CLABE: {g.clabe}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection><OrnamentDivider /></AnimatedSection>

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

          {/* SIGN-OFF */}
          <AnimatedSection>
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <SimpleWave />
              <p
                style={{
                  fontFamily: 'var(--font-dancing)',
                  fontSize: '1.8rem',
                  color: 'var(--w-blue)',
                  marginTop: 12,
                }}
              >
                Con amor {groomName} y Gilli:
              </p>
            </div>
          </AnimatedSection>

        </CornerOrnamentBox>
      </div>
    </div>
  )
}
