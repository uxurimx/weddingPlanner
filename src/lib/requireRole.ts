// Call from Server Components to enforce role access.
// Redirects to /overview if the current user's role is not allowed.

import { redirect } from 'next/navigation'
import { getCurrentUserRole } from '@/db/actions/users'
import { type UserRole } from '@/lib/rbac'

export async function requireRole(...allowed: UserRole[]): Promise<UserRole> {
  const role = await getCurrentUserRole()
  if (!(allowed as string[]).includes(role)) {
    redirect('/overview')
  }
  return role
}
