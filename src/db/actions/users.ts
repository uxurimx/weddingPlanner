'use server'

import { db } from '@/db'
import { users } from '@/db/schema'
import { eq, asc, count } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { type UserRole, ROLES } from '@/lib/rbac'

export type UserRow = {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
}

type ActionState = { success?: boolean; error?: string } | null

// ─── Sync current Clerk user into our DB ──────────────────────────────────────
// Call from dashboard layout on every authenticated load.
// Returns the user's role (first user becomes super_admin, others default to admin).

export async function syncCurrentUser(params: {
  id: string
  email: string
  name: string
}): Promise<UserRole> {
  try {
    // Check if they already exist
    const [existing] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, params.id))
      .limit(1)

    if (existing) {
      // Update name/email in case they changed in Clerk, preserve role
      await db
        .update(users)
        .set({ email: params.email, name: params.name })
        .where(eq(users.id, params.id))
      return existing.role as UserRole
    }

    // New user — first ever user becomes super_admin
    const [{ total }] = await db.select({ total: count() }).from(users)
    const role: UserRole = total === 0 ? 'super_admin' : 'admin'

    await db.insert(users).values({
      id:    params.id,
      email: params.email,
      name:  params.name,
      role,
    })
    return role
  } catch (e) {
    console.error('[syncCurrentUser]', e)
    return 'admin'
  }
}

// ─── Get current user's role ──────────────────────────────────────────────────

export async function getCurrentUserRole(): Promise<UserRole> {
  const { userId } = await auth()
  if (!userId) return 'viewer'

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return (user?.role as UserRole) ?? 'admin'
}

// ─── List all users ───────────────────────────────────────────────────────────

export async function getUsers(): Promise<UserRow[]> {
  const rows = await db
    .select()
    .from(users)
    .orderBy(asc(users.createdAt))

  return rows.map(r => ({
    ...r,
    role: r.role as UserRole,
    createdAt: r.createdAt ?? new Date(),
  }))
}

// ─── Update a user's role (super_admin only) ──────────────────────────────────

export async function updateUserRole(
  targetId: string,
  newRole: UserRole,
): Promise<ActionState> {
  const { userId } = await auth()
  if (!userId) return { error: 'No autenticado.' }

  const [caller] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1)
  if (caller?.role !== 'super_admin') return { error: 'Sin permisos.' }
  if (targetId === userId) return { error: 'No puedes cambiar tu propio rol.' }
  if (!(ROLES as readonly string[]).includes(newRole)) return { error: 'Rol inválido.' }

  await db.update(users).set({ role: newRole }).where(eq(users.id, targetId))
  revalidatePath('/users')
  return { success: true }
}

// ─── Remove user from the system (super_admin only) ───────────────────────────
// This removes from our DB only — the Clerk account is NOT deleted.

export async function removeUser(targetId: string): Promise<ActionState> {
  const { userId } = await auth()
  if (!userId) return { error: 'No autenticado.' }

  const [caller] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1)
  if (caller?.role !== 'super_admin') return { error: 'Sin permisos.' }
  if (targetId === userId) return { error: 'No puedes eliminarte a ti mismo.' }

  await db.delete(users).where(eq(users.id, targetId))
  revalidatePath('/users')
  return { success: true }
}
