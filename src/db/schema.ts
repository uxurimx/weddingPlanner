import {
  pgTable,
  pgEnum,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const invitationStatusEnum = pgEnum('invitation_status', [
  'created', 'sent', 'viewed', 'confirmed', 'cancelled', 'present',
]);

export const mediaTypeEnum = pgEnum('media_type', ['photo', 'video']);

export const giftTypeEnum = pgEnum('gift_type', [
  'registry', 'bank_transfer', 'honeymoon', 'other',
]);

export const tableCategoryEnum = pgEnum('table_category', [
  'vip', 'familia', 'amigos', 'trabajo', 'otro',
]);

// ─── Users (synced from Clerk) ────────────────────────────────────────────────

export const users = pgTable('users', {
  id:        text('id').primaryKey(), // Clerk user ID
  email:     text('email').notNull(),
  name:      text('name').notNull(),
  role:      varchar('role', { length: 50 }).notNull().default('admin'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Event ────────────────────────────────────────────────────────────────────

export const events = pgTable('events', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  name:                text('name').notNull(),
  slug:                varchar('slug', { length: 100 }).unique(),
  date:                timestamp('date').notNull(),
  status:              varchar('status', { length: 20 }).notNull().default('planning'),
  dressCode:           text('dress_code'),
  dressCodeNotes:      text('dress_code_notes'),
  eventNotes:          text('event_notes'),      // "Sin niños · Pases intransferibles"
  isCheckinActive:     boolean('is_checkin_active').notNull().default(false),
  isPostEventActive:   boolean('is_post_event_active').notNull().default(false),
  photographerToken:   uuid('photographer_token').defaultRandom(),
  rsvpDeadline:        timestamp('rsvp_deadline'),
  createdAt:           timestamp('created_at').defaultNow(),
  updatedAt:           timestamp('updated_at').defaultNow(),
});

// ─── Couple ───────────────────────────────────────────────────────────────────

export const couple = pgTable('couple', {
  id:               uuid('id').primaryKey().defaultRandom(),
  eventId:          uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  groomName:        text('groom_name').notNull().default(''),
  groomNickname:    text('groom_nickname'),
  groomFather:      text('groom_father'),
  groomMother:      text('groom_mother'),
  brideName:        text('bride_name').notNull().default(''),
  brideNickname:    text('bride_nickname'),
  brideFather:      text('bride_father'),
  brideMother:      text('bride_mother'),
  story:            text('story'),
  quote:            text('quote'),
  quoteSource:      text('quote_source'),
  invitationText:   text('invitation_text'),
  songTitle:        text('song_title'),
  songUrl:          text('song_url'),
  coverPhotoUrl:    text('cover_photo_url'),
  storyPhotoUrl:    text('story_photo_url'),
  heroPhotoUrl:     text('hero_photo_url'),
  createdAt:        timestamp('created_at').defaultNow(),
  updatedAt:        timestamp('updated_at').defaultNow(),
});

// ─── Venues ───────────────────────────────────────────────────────────────────

export const venues = pgTable('venues', {
  id:            uuid('id').primaryKey().defaultRandom(),
  eventId:       uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  type:          varchar('type', { length: 20 }).notNull().default('ceremony'), // 'ceremony' | 'reception'
  name:          text('name').notNull(),
  address:       text('address'),
  city:          text('city'),
  state:         text('state'),
  zipCode:       varchar('zip_code', { length: 10 }),
  googleMapsUrl: text('google_maps_url'),
  wazeUrl:       text('waze_url'),
  lat:           varchar('lat', { length: 20 }),
  lng:           varchar('lng', { length: 20 }),
  startTime:     timestamp('start_time'),
  notes:         text('notes'),
  order:         integer('order').notNull().default(0),
  createdAt:     timestamp('created_at').defaultNow(),
  updatedAt:     timestamp('updated_at').defaultNow(),
});

// ─── Tables (seating) ─────────────────────────────────────────────────────────

export const tablesSeating = pgTable('tables_seating', {
  id:        uuid('id').primaryKey().defaultRandom(),
  eventId:   uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  number:    integer('number').notNull(),
  name:      text('name'),           // "Mesa 1" or "Mesa Familia García"
  capacity:  integer('capacity').notNull().default(10),
  category:  tableCategoryEnum('category').default('amigos'),
  notes:     text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Invitations ──────────────────────────────────────────────────────────────

export const invitations = pgTable('invitations', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  eventId:              uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  token:                uuid('token').notNull().unique().defaultRandom(), // used in URL and QR
  invitationNumber:     integer('invitation_number'),                    // display number (#047)
  familyName:           text('family_name').notNull(),                  // "Familia Simpson"
  contactName:          text('contact_name').notNull(),                 // "Homero Simpson"
  contactPhone:         text('contact_phone'),
  contactEmail:         text('contact_email'),
  totalPasses:          integer('total_passes').notNull().default(1),
  confirmedCount:       integer('confirmed_count').default(0),
  tableId:              uuid('table_id').references(() => tablesSeating.id, { onDelete: 'set null' }),
  status:               invitationStatusEnum('status').notNull().default('created'),
  dietaryNotes:         text('dietary_notes'),
  adminNotes:           text('admin_notes'),
  confirmationMessage:  text('confirmation_message'),  // message from guest on confirm
  qrDownloadedAt:       timestamp('qr_downloaded_at'),
  sentAt:               timestamp('sent_at'),
  viewedAt:             timestamp('viewed_at'),
  confirmedAt:          timestamp('confirmed_at'),
  cancelledAt:          timestamp('cancelled_at'),
  checkedInAt:          timestamp('checked_in_at'),
  videoMessageUploaded: boolean('video_message_uploaded').notNull().default(false),
  createdAt:            timestamp('created_at').defaultNow(),
  updatedAt:            timestamp('updated_at').defaultNow(),
});

// ─── Invitation Guests (individuals within an invitation) ─────────────────────

export const invitationGuests = pgTable('invitation_guests', {
  id:           uuid('id').primaryKey().defaultRandom(),
  invitationId: uuid('invitation_id').notNull().references(() => invitations.id, { onDelete: 'cascade' }),
  name:         text('name').notNull(),
  isConfirmed:  boolean('is_confirmed').notNull().default(false),
  ageGroup:     varchar('age_group', { length: 10 }).notNull().default('adult'), // adult | child | baby
  createdAt:    timestamp('created_at').defaultNow(),
});

// ─── Itinerary ────────────────────────────────────────────────────────────────

export const itineraryItems = pgTable('itinerary_items', {
  id:          uuid('id').primaryKey().defaultRandom(),
  eventId:     uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  order:       integer('order').notNull().default(0),
  time:        text('time').notNull(),   // "2:30 PM"
  title:       text('title').notNull(),
  description: text('description'),
  icon:        text('icon'),             // emoji or icon name
  isVisible:   boolean('is_visible').notNull().default(true),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow(),
});

// ─── Gifts & Registries ───────────────────────────────────────────────────────

export const giftRegistries = pgTable('gift_registries', {
  id:             uuid('id').primaryKey().defaultRandom(),
  eventId:        uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  type:           giftTypeEnum('type').notNull(),
  storeName:      text('store_name'),
  url:            text('url'),
  listNumber:     text('list_number'),
  bankName:       text('bank_name'),
  accountHolder:  text('account_holder'),
  accountNumber:  text('account_number'),
  clabe:          text('clabe'),
  speiQrUrl:      text('spei_qr_url'),
  description:    text('description'),
  isActive:       boolean('is_active').notNull().default(true),
  order:          integer('order').notNull().default(0),
  createdAt:      timestamp('created_at').defaultNow(),
  updatedAt:      timestamp('updated_at').defaultNow(),
});

// ─── Media Folders ────────────────────────────────────────────────────────────

export const mediaFolders = pgTable('media_folders', {
  id:          uuid('id').primaryKey().defaultRandom(),
  eventId:     uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  name:        text('name').notNull(),
  description: text('description'),
  isPublic:    boolean('is_public').notNull().default(false),
  order:       integer('order').notNull().default(0),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow(),
});

// ─── Media Uploads ────────────────────────────────────────────────────────────

export const mediaUploads = pgTable('media_uploads', {
  id:           uuid('id').primaryKey().defaultRandom(),
  eventId:      uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  invitationId: uuid('invitation_id').references(() => invitations.id, { onDelete: 'set null' }),
  folderId:     uuid('folder_id').references(() => mediaFolders.id, { onDelete: 'set null' }),
  type:         mediaTypeEnum('type').notNull(),
  url:          text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  fileName:     text('file_name'),
  fileSize:     integer('file_size'),    // bytes
  mimeType:     text('mime_type'),
  isApproved:   boolean('is_approved').notNull().default(true),
  uploadedAt:   timestamp('uploaded_at').defaultNow(),
});

// ─── Video Messages (private to the couple) ───────────────────────────────────

export const videoMessages = pgTable('video_messages', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  eventId:            uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  invitationId:       uuid('invitation_id').notNull().references(() => invitations.id, { onDelete: 'cascade' }),
  url:                text('url').notNull(),
  thumbnailUrl:       text('thumbnail_url'),
  duration:           integer('duration'),   // seconds
  isViewedByCouple:   boolean('is_viewed_by_couple').notNull().default(false),
  recordedAt:         timestamp('recorded_at').defaultNow(),
});

// ─── Notifications Log ────────────────────────────────────────────────────────

// ─── Upload Debug Log ─────────────────────────────────────────────────────────

export const uploadLogs = pgTable('upload_logs', {
  id:         uuid('id').primaryKey().defaultRandom(),
  createdAt:  timestamp('created_at').defaultNow(),
  slug:       text('slug'),              // 'photographerUpload' | 'guestUpload' | 'videoMessage'
  phase:      text('phase').notNull(),   // 'middleware_start' | 'middleware_ok' | 'middleware_error' | 'complete_start' | 'complete_ok' | 'complete_error'
  status:     varchar('status', { length: 10 }).notNull().default('ok'), // 'ok' | 'error'
  message:    text('message'),
  details:    text('details'),           // JSON
  errorMsg:   text('error_msg'),
  errorStack: text('error_stack'),
})

export const notificationsLog = pgTable('notifications_log', {
  id:           uuid('id').primaryKey().defaultRandom(),
  eventId:      uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  invitationId: uuid('invitation_id').references(() => invitations.id, { onDelete: 'set null' }),
  type:         varchar('type', { length: 50 }).notNull(), // confirmation | checkin | photo | video
  channel:      varchar('channel', { length: 20 }).notNull().default('web_push'),
  message:      text('message'),
  isRead:       boolean('is_read').notNull().default(false),
  sentAt:       timestamp('sent_at').defaultNow(),
});
