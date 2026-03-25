/**
 * Limpieza del schema anterior (Tinta y Café POS).
 * Elimina tablas y constraints obsoletos antes de correr db:push.
 *
 * Uso: node scripts/cleanup-old-schema.mjs
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

const steps = [
  // 1. Remover constraint FK obsoleto en users
  {
    label: 'Eliminar FK constraint users_store_id_stores_id_fk',
    query: () => sql`ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS "users_store_id_stores_id_fk"`,
  },
  // 2. Remover columna store_id de users
  {
    label: 'Eliminar columna store_id de users',
    query: () => sql`ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS store_id`,
  },
  // 3. Eliminar tablas del sistema POS anterior (en orden que respeta FKs)
  { label: 'Drop transactions',   query: () => sql`DROP TABLE IF EXISTS transactions   CASCADE` },
  { label: 'Drop inventory',      query: () => sql`DROP TABLE IF EXISTS inventory       CASCADE` },
  { label: 'Drop items',          query: () => sql`DROP TABLE IF EXISTS items           CASCADE` },
  { label: 'Drop customers',      query: () => sql`DROP TABLE IF EXISTS customers       CASCADE` },
  { label: 'Drop role_modules',   query: () => sql`DROP TABLE IF EXISTS role_modules    CASCADE` },
  { label: 'Drop roles',          query: () => sql`DROP TABLE IF EXISTS roles           CASCADE` },
  { label: 'Drop stores',         query: () => sql`DROP TABLE IF EXISTS stores          CASCADE` },
  { label: 'Drop suppliers',      query: () => sql`DROP TABLE IF EXISTS suppliers       CASCADE` },
  { label: 'Drop categories',     query: () => sql`DROP TABLE IF EXISTS categories      CASCADE` },
  // 4. Limpiar enums viejos si existen
  { label: 'Drop enum old_role (si existe)',  query: () => sql`DROP TYPE IF EXISTS old_role  CASCADE` },
];

async function main() {
  console.log('🧹 Limpiando schema anterior...\n');

  for (const step of steps) {
    try {
      await step.query();
      console.log(`  ✅  ${step.label}`);
    } catch (err) {
      // Si ya no existe, no es un error crítico
      console.log(`  ⚠️   ${step.label} — ${err.message.split('\n')[0]}`);
    }
  }

  console.log('\n✨ Limpieza completa. Ahora corre:\n   npm run db:push\n');
}

main();
