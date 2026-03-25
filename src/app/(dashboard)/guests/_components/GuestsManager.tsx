'use client'

import { useState } from 'react'
import { Users, Table2 } from 'lucide-react'
import type { InvitationRow, TableWithOccupancy } from '@/db/actions/guests'
import InvitationsTab from './InvitationsTab'
import TablesTab from './TablesTab'

const TABS = [
  { id: 'invitations', label: 'Invitados', icon: Users },
  { id: 'tables',      label: 'Mesas',     icon: Table2 },
] as const

type TabId = typeof TABS[number]['id']

export default function GuestsManager({
  invitations,
  tables,
}: {
  invitations: InvitationRow[]
  tables: TableWithOccupancy[]
}) {
  const [activeTab, setActiveTab] = useState<TabId>('invitations')

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-2xl w-fit"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={
                active
                  ? { backgroundColor: 'var(--bg)', color: 'var(--fg)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: 'var(--fg-muted)' }
              }
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'invitations' && invitations.length > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={
                    active
                      ? { backgroundColor: 'var(--surface)', color: 'var(--fg-muted)' }
                      : { backgroundColor: 'var(--surface-2)', color: 'var(--fg-muted)' }
                  }
                >
                  {invitations.length}
                </span>
              )}
              {tab.id === 'tables' && tables.length > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={
                    active
                      ? { backgroundColor: 'var(--surface)', color: 'var(--fg-muted)' }
                      : { backgroundColor: 'var(--surface-2)', color: 'var(--fg-muted)' }
                  }
                >
                  {tables.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'invitations' && (
        <InvitationsTab invitations={invitations} tables={tables} />
      )}
      {activeTab === 'tables' && (
        <TablesTab tables={tables} />
      )}
    </div>
  )
}
