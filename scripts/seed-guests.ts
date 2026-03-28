/**
 * One-time seed script: insert the initial guest list into the DB.
 * Run with: npx tsx --env-file=.env.local scripts/seed-guests.ts
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../src/db/schema'
import { eq } from 'drizzle-orm'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL env var not set')
}

const db = drizzle(neon(process.env.DATABASE_URL), { schema })

const GUESTS: { nombre: string; tel: string | null }[] = [
  // grupo_1
  { nombre: 'Blessings Zavala', tel: '(667) 153 88 88' },
  { nombre: 'Kinnerette de Zavala', tel: '(667) 244 17 81' },
  { nombre: 'Roberto Valenzuela', tel: '(667) 266 44 64' },
  { nombre: 'Leidy de Valenzuela', tel: '(667) 996 27 36' },
  { nombre: 'Sofia Garzón', tel: '(667) 487 54 12' },
  { nombre: 'Miguel Quiñonez', tel: '(667) 402 29 70' },
  { nombre: 'Luz Dary Mora', tel: '(667) 251 27 69' },
  { nombre: 'Luis Lizarraga', tel: '(667) 176 18 77' },
  { nombre: 'Daniela de Lizarraga', tel: '(667) 408 09 51' },
  { nombre: 'Edgar Meza', tel: '(618) 219 73 23' },
  { nombre: 'Ana Paola de Lopez', tel: '(667) 450 70 87' },
  { nombre: 'Abraham Lopez', tel: '(687) 155 01 96' },
  { nombre: 'Jorge Inzunza', tel: '(667) 209 55 89' },
  { nombre: 'Nahomy de Inzunza', tel: '(667) 326 56 60' },
  { nombre: 'Elizabeth de Delgado', tel: '(667) 471 22 55' },
  { nombre: 'Manuel Delgado', tel: '(667) 294 54 30' },
  { nombre: 'Eduardo Escobar', tel: '(667) 774 09 20' },
  { nombre: 'Heidy de Escobar', tel: '(664) 503 64 12' },
  { nombre: 'Goyita Cota', tel: '(667) 416 24 35' },
  { nombre: 'Gabriel Salomón', tel: '(667) 161 42 52' },
  { nombre: 'Yolanda de Salomón', tel: '(667) 239 17 40' },
  { nombre: 'Stephanie Salomón', tel: '(667) 249 22 03' },
  { nombre: 'Gabriel Salomón M.', tel: '(667) 798 17 01' },
  { nombre: 'Roberto Baez', tel: '(667) 198 87 93' },
  { nombre: 'Francisco Medina', tel: '(667) 237 85 74' },
  { nombre: 'Jair Niebla', tel: '(667) 430 51 35' },
  { nombre: 'Manuel Melendrez', tel: '(667) 334 38 48' },
  { nombre: 'Ada de Melendrez', tel: '(667) 387 79 14' },
  { nombre: 'Ingrid Melendrez', tel: '(667) 333 22 91' },
  { nombre: 'Zulema López', tel: '(667) 474 11 61' },
  { nombre: 'Aiza Castro', tel: '(667) 187 86 94' },
  { nombre: 'Gabriel Vizcarra', tel: '(667) 198 71 06' },
  { nombre: 'Miriam de Vizcarra', tel: '(667) 198 71 08' },
  { nombre: 'Filiberto Zazueta', tel: '(667) 103 07 22' },
  { nombre: 'Guadalupe de Zazueta', tel: '(667) 190 74 17' },
  { nombre: 'Rodolfo Meza', tel: '(667) 210 30 13' },
  { nombre: 'Zaira de Meza', tel: '(667) 417 75 99' },
  { nombre: 'Oscar Ojeda', tel: null },
  { nombre: 'Teresa de Ojeda', tel: '(667) 153 34 09' },
  { nombre: 'Ana Espinoza', tel: '(667) 152 08 35' },
  { nombre: 'Zuleyka Noriega', tel: '(667) 319 62 13' },
  { nombre: 'David Meza', tel: '(667) 224 42 73' },
  { nombre: 'Carmen de Meza', tel: '(667) 328 66 86' },
  { nombre: 'Eliab Gonzalez', tel: '(667) 748 16 28' },
  { nombre: 'Febe de Gonzalez', tel: '(667) 348 60 13' },
  { nombre: 'Edgar Sánchez C.', tel: '(667) 447 02 03' },
  { nombre: 'Grecia Valenzuela', tel: '(667) 392 90 84' },
  { nombre: 'Xochilt de Sánchez', tel: '(664) 190 39 63' },
  { nombre: 'Edgar Sanchez', tel: '(667) 151 06 14' },
  { nombre: 'Hiram Sánchez', tel: '(667) 447 13 26' },
  { nombre: 'Mayra de Sánchez', tel: '(667) 267 79 02' },
  { nombre: 'Oscar Ojeda', tel: '(667) 182 74 71' },
  { nombre: 'Zobeida de Ojeda', tel: '(667) 255 45 04' },
  { nombre: 'Orlando Flores', tel: '(667) 775 21 54' },
  { nombre: 'Diana de Flores', tel: '(667) 131 71 66' },
  { nombre: 'Eber Matías', tel: '(667) 319 99 61' },
  { nombre: 'Mariana de Matías', tel: '(667) 410 33 04' },
  { nombre: 'Domingo Beltrán', tel: '(667) 355 46 75' },
  { nombre: 'Lores de Beltrán', tel: '(667) 268 68 37' },
  { nombre: 'José Agel Beltrán', tel: '(667) 104 33 08' },
  { nombre: 'Laura de Beltrán', tel: '(667) 306 97 78' },
  // grupo_2
  { nombre: 'Jehú Sauceda', tel: '(667) 187 78 30' },
  { nombre: 'Neyda de Sauceda', tel: '(667) 189 74 20' },
  { nombre: 'Carlos Sauceda', tel: '(667) 746 96 50' },
  { nombre: 'Naara Sauceda', tel: '(667) 408 115 451' },
  { nombre: 'Hector Villarreal', tel: '(667) 102 40 47' },
  { nombre: 'Alicia Villarreal', tel: '(667) 195 02 64' },
  { nombre: 'Ana de Perez', tel: '(667) 183 35 21' },
  { nombre: 'Humberto Perez', tel: '(667) 215 49 98' },
  { nombre: 'Edgar Villarreal', tel: '(552) 265 54 46' },
  { nombre: 'Carmen de Villarreal', tel: null },
  { nombre: 'Gerardo Cortés', tel: '(667) 161 01 64' },
  { nombre: 'Fernanda de Cortés', tel: '(667) 323 49 83' },
  { nombre: 'Gael Cortés', tel: '(667) 252 29 42' },
  { nombre: 'Diego Cortés', tel: null },
  { nombre: 'Ada Luz Sauceda', tel: '(667) 301 63 45' },
  { nombre: 'José Luis Gálvez', tel: null },
  { nombre: 'Miguel Gastelum', tel: '+1 (562) 837 60 72' },
  { nombre: 'Oscar Gastelum', tel: null },
  { nombre: 'Kevin Gastelum', tel: '(667) 546 64 59' },
  { nombre: 'Pamely de Gastelum', tel: '(667) 570 62 86' },
  { nombre: 'Florencia Beltrán', tel: null },
  { nombre: 'Addi Villarreal', tel: null },
  { nombre: 'Manuel Madrigal', tel: '+1 (602) 488 05 45' },
  { nombre: 'Consuelo de Madrigal', tel: null },
  { nombre: 'Rafael Madrigal', tel: null },
  { nombre: 'Martha de Madrigal', tel: null },
  { nombre: 'Mila Madrigal', tel: null },
  { nombre: 'Samuel Gonzalez', tel: '(673) 47 21 125' },
  { nombre: 'Hermelinda de Gonzalez', tel: null },
  { nombre: 'Job Sauceda', tel: '(667) 162 27 15' },
  { nombre: 'Adolfina', tel: null },
  { nombre: 'Nely', tel: null },
  { nombre: 'Miguel Garcia', tel: null },
  { nombre: 'Elizabeth Villarreal', tel: '+1 (909) 218 66 41' },
  { nombre: 'Noé Sauceda', tel: '(667) 183 00 26' },
  { nombre: 'Alicia', tel: null },
  { nombre: 'Leonardo', tel: null },
  { nombre: 'Evelyn', tel: null },
  { nombre: 'Misael', tel: null },
  { nombre: 'Saúl Gonzales', tel: null },
  { nombre: 'Alicia Cárdenas', tel: null },
  { nombre: 'Gema Gonzalez', tel: '(612) 214 77 76' },
  { nombre: 'Mario', tel: null },
  { nombre: 'Samuel', tel: null },
  { nombre: 'José María', tel: null },
  { nombre: 'Olivia', tel: '+1 (562) 738 20 45' },
  { nombre: 'Alejandrina de Manjarrez', tel: null },
  { nombre: 'Octavio Manjarrez', tel: null },
  { nombre: 'Silvia Manjarrez', tel: null },
  // grupo_3
  { nombre: 'Andrés Juárez', tel: '(667) 244 43 87' },
  { nombre: 'Fátima de Juárez', tel: '(667) 176 54 57' },
  { nombre: 'Héctor Juárez', tel: '(667) 361 74 23' },
  { nombre: 'Adán Corrales', tel: '(667) 355 43 35' },
  { nombre: 'Ailee de Corrales', tel: '(667) 242 56 37' },
  { nombre: 'Erika de Ballesteros', tel: '(667) 361 98 56' },
  { nombre: 'Ailed Valenzuela', tel: '(667) 405 07 94' },
  { nombre: 'Agustín Ballesteros', tel: null },
  { nombre: 'Elaine Noriega', tel: '(667) 428 70 15' },
  { nombre: 'Juan Carlos', tel: null },
  { nombre: 'Virginia Noriega', tel: '(667) 103 40 58' },
  { nombre: 'Judith Rios', tel: '(672) 854 46 06' },
  { nombre: 'Idna Rocha', tel: '(667) 209 12 21' },
  { nombre: 'Concepción Olivas', tel: null },
  { nombre: 'Alejandro Perez', tel: '(667) 117 12 46' },
  { nombre: 'Sugey de Perez', tel: '(667) 162 62 48' },
  { nombre: 'Jafet Perez', tel: '(667) 230 80 89' },
  { nombre: 'Octavio Manjarrez', tel: '(667) 191 97 49' },
  { nombre: 'Miriam de Manjarrez', tel: '(667) 354 33 17' },
  { nombre: 'Dayanna Manjarrez', tel: '(644) 37 85 03' },
  { nombre: 'Odalys Manjarrez', tel: null },
  { nombre: 'Jesús Flores', tel: '(667) 157 06 73' },
  { nombre: 'Martha de Flores', tel: '(667) 514 22 24' },
  { nombre: 'Rubén Castelo', tel: '(667) 995 89 12' },
  { nombre: 'Denisse de Castelo', tel: '(667) 206 71 38' },
  { nombre: 'Jonathan Ramos', tel: null },
  { nombre: 'Citlaly de Ramos', tel: null },
  { nombre: 'Ismael Burgueño', tel: '(667) 430 06 66' },
  { nombre: 'Aridaí de Burgueño', tel: '(667) 739 57 53' },
  { nombre: 'Manuelito Papi', tel: '(667) 184 87 17' },
  { nombre: 'Luis Ramos', tel: '(667) 177 75 36' },
  { nombre: 'Nohemí de Ramos', tel: null },
  { nombre: 'Mariana de Gamboa', tel: '(667) 494 72 51' },
  { nombre: 'Brandon Gamboa', tel: null },
  { nombre: 'Santiago Medrano', tel: '(667) 225 84 06' },
  { nombre: 'Juan Rivera', tel: '(667) 329 25 03' },
  { nombre: 'Zaira de Rivera', tel: '(667) 730 68 53' },
  { nombre: 'Brenan Villarreal', tel: '(667) 420 86 05' },
  { nombre: 'Elihú Rios', tel: '(667) 389 79 87' },
  { nombre: 'Job Bernal', tel: '(667) 336 64 46' },
  { nombre: 'Miguel Olivas', tel: '(667) 216 51 29' },
  { nombre: 'Carlos Marquez Castro', tel: null },
  { nombre: 'Euge de Castro', tel: '(667) 191 09 90' },
  { nombre: 'Carlos Castro M.', tel: null },
  { nombre: 'Jesse Ibarra', tel: '(667) 122 52 92' },
  // grupo_4
  { nombre: 'Arturo Aréchiga', tel: '(667) 395 45 01' },
  { nombre: 'Ana Velia Torres', tel: '(667) 481 99 85' },
  { nombre: 'Nicole Aréchiga', tel: '(667) 348 30 08' },
  { nombre: 'Valentino Beltrán', tel: '(667) 698 57 70' },
  { nombre: 'Stefania Aréchiga', tel: '(667) 221 84 68' },
  { nombre: 'Pedro Villafañe', tel: '(667) 175 72 95' },
  { nombre: 'Elva Aréchiga', tel: '(667) 995 42 21' },
  { nombre: 'Erick Bojorquez', tel: '(667) 211 74 45' },
  { nombre: 'Isairis Aréchiga', tel: '(664) 327 99 80' },
  { nombre: 'Francisco Carrillo', tel: '(664) 328 72 46' },
  { nombre: 'Luis Fernando Carrillo', tel: '(663) 402 64 29' },
  { nombre: 'Jesús Torres', tel: null },
  { nombre: 'Diami Araiza', tel: null },
  { nombre: 'Jid Torres', tel: null },
  { nombre: 'Ma. Carmen Laveaga', tel: '(667) 128 40 10' },
  { nombre: 'Carlos Camacho', tel: null },
  { nombre: 'Lourdes Laveaga', tel: '(667) 208 09 36' },
  { nombre: 'Lourdes', tel: null },
  { nombre: 'Rosendo Madrid', tel: null },
  { nombre: 'Elías Cárdenas', tel: null },
  { nombre: 'Lorena Aguilar', tel: '(667) 459 50 12' },
]

async function main() {
  // Get event ID
  const [event] = await db.select({ id: schema.events.id }).from(schema.events).limit(1)
  if (!event) {
    console.error('❌  No event found in DB. Create an event first.')
    process.exit(1)
  }

  // Get the current highest invitationNumber to continue from there
  const existing = await db
    .select({ invitationNumber: schema.invitations.invitationNumber })
    .from(schema.invitations)
    .where(eq(schema.invitations.eventId, event.id))

  const maxNum = existing.reduce((max, r) => Math.max(max, r.invitationNumber ?? 0), 0)
  console.log(`ℹ️   ${existing.length} existing invitations found. Starting numbering from ${maxNum + 1}.`)
  console.log(`🎯  Inserting ${GUESTS.length} invitations for event ${event.id}...`)

  const rows = GUESTS.map((g, i) => ({
    eventId:          event.id,
    familyName:       g.nombre,
    contactName:      g.nombre,
    contactPhone:     g.tel ?? null,
    totalPasses:      1,
    invitationNumber: maxNum + i + 1,
    status:           'created' as const,
  }))

  // Insert in batches of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50)
    await db.insert(schema.invitations).values(batch)
    console.log(`  ✓  Inserted batch ${Math.floor(i / 50) + 1} (${i + 1}–${Math.min(i + 50, rows.length)})`)
  }

  console.log(`\n✅  Done! ${GUESTS.length} invitations created.`)
}

main().catch(err => {
  console.error('❌ ', err)
  process.exit(1)
})
