'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Heart,
  LayoutDashboard,
  BookOpen,
  Clock,
  Gift,
  Users,
  Image,
  Camera,
  ScanLine,
  ShieldCheck,
  Settings,
  ChevronRight,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'
import { siteConfig } from '@/config/site'
import ThemeToggle from '@/components/ThemeToggle'
import NotificationBell from '@/components/NotificationBell'
import { type UserRole, NAV_VISIBILITY, ROLE_LABELS, ROLE_COLORS } from '@/lib/rbac'

type NavItem = {
  name: string
  href: string
  icon: LucideIcon
}

type NavSection = {
  label?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      { name: 'Dashboard', href: '/overview', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Evento',
    items: [
      { name: 'Información',  href: '/information', icon: BookOpen },
      { name: 'Itinerario',   href: '/itinerary',   icon: Clock    },
      { name: 'Regalos',      href: '/gifts',        icon: Gift     },
    ],
  },
  {
    label: 'Invitados',
    items: [
      { name: 'Invitados', href: '/guests', icon: Users },
    ],
  },
  {
    label: 'Media',
    items: [
      { name: 'Social',    href: '/social',       icon: Image  },
      { name: 'Fotógrafo', href: '/photographer', icon: Camera },
    ],
  },
  {
    label: 'Operación',
    items: [
      { name: 'Check-in', href: '/checkin', icon: ScanLine   },
      { name: 'Usuarios', href: '/users',   icon: ShieldCheck },
    ],
  },
  {
    items: [
      { name: 'Configuración', href: '/settings', icon: Settings },
    ],
  },
]

export default function SideNav({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const { user } = useUser()
  const [open, setOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const visibleSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        const allowed = NAV_VISIBILITY[item.href]
        return !allowed || (allowed as string[]).includes(role)
      }),
    }))
    .filter(section => section.items.length > 0)

  const sidebarContent = (
    <div
      className="h-screen w-64 flex flex-col p-4 border-r overflow-y-auto"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Mobile close button */}
      <button
        className="absolute top-3 right-3 p-1.5 rounded-lg md:hidden"
        style={{ color: 'var(--fg-muted)' }}
        onClick={() => setOpen(false)}
        aria-label="Cerrar menú"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <Heart className="text-rose-500 w-5 h-5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-outfit font-bold text-base leading-tight" style={{ color: 'var(--fg)' }}>
            {siteConfig.name}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
            {siteConfig.tagline}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {visibleSections.map((section, sIdx) => (
          <div key={sIdx} className={sIdx > 0 ? 'pt-3' : ''}>
            {section.label && (
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--fg-muted)' }}>
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/20'
                      : 'text-[var(--fg-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-indigo-500 transition-colors'}`}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 space-y-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="px-2">
          <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${ROLE_COLORS[role]}`}>
            {ROLE_LABELS[role]}
          </span>
        </div>
        <div className="flex items-center justify-between px-2">
          <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>Tema</span>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
        <div
          className="flex items-center gap-3 px-2 py-2.5 rounded-xl border"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
        >
          <UserButton
            afterSignOutUrl="/"
            appearance={{ elements: { userButtonAvatarBox: 'w-8 h-8 rounded-lg' } }}
          />
          <div className="flex flex-col overflow-hidden text-left">
            <span className="text-xs font-semibold truncate" style={{ color: 'var(--fg)' }}>
              {user?.firstName ?? 'Usuario'} {user?.lastName ?? ''}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--fg-muted)' }}>
              {user?.primaryEmailAddress?.emailAddress ?? ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center px-4 gap-3 border-b md:hidden"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl transition-colors"
          style={{ color: 'var(--fg)' }}
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <Heart className="text-rose-500 w-4 h-4" />
          </div>
          <span className="font-outfit font-bold text-sm" style={{ color: 'var(--fg)' }}>
            {siteConfig.name}
          </span>
        </div>
      </header>

      {/* ── Mobile backdrop ────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────────────────── */}
      {/* Desktop: always visible, fixed */}
      {/* Mobile: slide in/out overlay */}
      <div
        className={[
          'fixed left-0 top-0 z-[60] transition-transform duration-300 ease-in-out relative',
          'md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {sidebarContent}
      </div>
    </>
  )
}
