import { currentUser } from '@clerk/nextjs/server'
import SideNav from '@/components/SideNav'
import { syncCurrentUser } from '@/db/actions/users'
import type { UserRole } from '@/lib/rbac'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Sync current Clerk user into our DB and get their role
  let role: UserRole = 'admin'
  const clerkUser = await currentUser()
  if (clerkUser) {
    role = await syncCurrentUser({
      id:    clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
      name:  `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || clerkUser.id,
    })
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg)' }}>
      <SideNav role={role} />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen pt-14 md:pt-0 relative overflow-y-auto">
        {/* Subtle ambient glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-[100px] pointer-events-none -z-10" />
        {children}
      </main>
    </div>
  )
}
