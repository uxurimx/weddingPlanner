'use client'

import { useState } from 'react'
import CoupleTab  from './CoupleTab'
import EventTab   from './EventTab'
import VenuesTab  from './VenuesTab'
import SongTab    from './SongTab'

type Tab = 'couple' | 'event' | 'venues' | 'song'

const tabs: { id: Tab; label: string; emoji: string }[] = [
  { id: 'couple', label: 'Pareja',   emoji: '💑' },
  { id: 'event',  label: 'Evento',   emoji: '📅' },
  { id: 'venues', label: 'Venues',   emoji: '📍' },
  { id: 'song',   label: 'Canción',  emoji: '🎵' },
]

type Props = {
  data: {
    event:  { date: Date; dressCode: string | null; dressCodeNotes: string | null; eventNotes: string | null }
    couple: {
      groomName: string; groomNickname: string | null; groomFather: string | null; groomMother: string | null
      brideName: string; brideNickname: string | null; brideFather: string | null; brideMother: string | null
      story: string | null; quote: string | null; quoteSource: string | null; invitationText: string | null
      songTitle: string | null; songUrl: string | null
    } | null
    venues: Array<{
      id: string; type: string; name: string; address: string | null; city: string | null
      state: string | null; zipCode: string | null; googleMapsUrl: string | null
      wazeUrl: string | null; startTime: Date | null; notes: string | null
    }>
  }
}

export default function InfoTabs({ data }: Props) {
  const [active, setActive] = useState<Tab>('couple')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 mb-8 border-b" style={{ borderColor: "var(--border)" }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              active === tab.id
                ? 'border-indigo-500 text-indigo-500'
                : 'border-transparent hover:text-[var(--fg)]'
            }`}
            style={{ color: active === tab.id ? undefined : "var(--fg-muted)" }}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {active === 'couple' && <CoupleTab couple={data.couple} />}
        {active === 'event'  && <EventTab  event={data.event}   />}
        {active === 'venues' && <VenuesTab venues={data.venues} />}
        {active === 'song'   && <SongTab   couple={data.couple} />}
      </div>
    </div>
  )
}
