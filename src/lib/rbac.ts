// Role-Based Access Control — roles, labels, colors, and route access matrix

export const ROLES = ['super_admin', 'admin', 'planner', 'receptionist', 'viewer'] as const
export type UserRole = typeof ROLES[number]

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin:  'Super Admin',
  admin:        'Admin',
  planner:      'Planner',
  receptionist: 'Recepcionista',
  viewer:       'Viewer',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin:  'text-violet-500 bg-violet-500/10 border-violet-500/20',
  admin:        'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  planner:      'text-blue-500   bg-blue-500/10   border-blue-500/20',
  receptionist: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  viewer:       'text-gray-500   bg-gray-500/10   border-gray-500/20',
}

// Routes accessible per role (prefix match)
export const ROUTE_ACCESS: Record<string, UserRole[]> = {
  '/overview':     ['super_admin', 'admin', 'planner', 'receptionist', 'viewer'],
  '/information':  ['super_admin', 'admin', 'planner'],
  '/itinerary':    ['super_admin', 'admin', 'planner'],
  '/gifts':        ['super_admin', 'admin', 'planner'],
  '/guests':       ['super_admin', 'admin', 'planner'],
  '/social':       ['super_admin', 'admin', 'planner', 'viewer'],
  '/photographer': ['super_admin', 'admin'],
  '/checkin':      ['super_admin', 'admin', 'planner', 'receptionist'],
  '/users':        ['super_admin'],
  '/settings':     ['super_admin', 'admin'],
  '/debug':        ['super_admin', 'admin'],
}

export function canAccess(role: UserRole, path: string): boolean {
  for (const [route, allowed] of Object.entries(ROUTE_ACCESS)) {
    if (path === route || path.startsWith(route + '/')) {
      return (allowed as string[]).includes(role)
    }
  }
  return false
}

// Which routes are visible in the sidebar per role
export const NAV_VISIBILITY: Record<string, UserRole[]> = ROUTE_ACCESS
