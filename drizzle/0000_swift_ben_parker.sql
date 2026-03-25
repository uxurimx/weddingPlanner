CREATE TYPE "public"."gift_type" AS ENUM('registry', 'bank_transfer', 'honeymoon', 'other');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('created', 'sent', 'viewed', 'confirmed', 'cancelled', 'present');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('photo', 'video');--> statement-breakpoint
CREATE TYPE "public"."table_category" AS ENUM('vip', 'familia', 'amigos', 'trabajo', 'otro');--> statement-breakpoint
CREATE TABLE "couple" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"groom_name" text DEFAULT '' NOT NULL,
	"groom_nickname" text,
	"groom_father" text,
	"groom_mother" text,
	"bride_name" text DEFAULT '' NOT NULL,
	"bride_nickname" text,
	"bride_father" text,
	"bride_mother" text,
	"story" text,
	"quote" text,
	"quote_source" text,
	"invitation_text" text,
	"song_title" text,
	"song_url" text,
	"cover_photo_url" text,
	"story_photo_url" text,
	"hero_photo_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(100),
	"date" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'planning' NOT NULL,
	"dress_code" text,
	"dress_code_notes" text,
	"event_notes" text,
	"is_checkin_active" boolean DEFAULT false NOT NULL,
	"is_post_event_active" boolean DEFAULT false NOT NULL,
	"photographer_token" uuid DEFAULT gen_random_uuid(),
	"rsvp_deadline" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gift_registries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"type" "gift_type" NOT NULL,
	"store_name" text,
	"url" text,
	"list_number" text,
	"bank_name" text,
	"account_holder" text,
	"account_number" text,
	"clabe" text,
	"spei_qr_url" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invitation_guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_confirmed" boolean DEFAULT false NOT NULL,
	"age_group" varchar(10) DEFAULT 'adult' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"invitation_number" integer,
	"family_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_phone" text,
	"contact_email" text,
	"total_passes" integer DEFAULT 1 NOT NULL,
	"confirmed_count" integer DEFAULT 0,
	"table_id" uuid,
	"status" "invitation_status" DEFAULT 'created' NOT NULL,
	"dietary_notes" text,
	"admin_notes" text,
	"confirmation_message" text,
	"qr_downloaded_at" timestamp,
	"sent_at" timestamp,
	"viewed_at" timestamp,
	"confirmed_at" timestamp,
	"cancelled_at" timestamp,
	"checked_in_at" timestamp,
	"video_message_uploaded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "itinerary_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"time" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"icon" text,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"invitation_id" uuid,
	"folder_id" uuid,
	"type" "media_type" NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"file_name" text,
	"file_size" integer,
	"mime_type" text,
	"is_approved" boolean DEFAULT true NOT NULL,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"invitation_id" uuid,
	"type" varchar(50) NOT NULL,
	"channel" varchar(20) DEFAULT 'web_push' NOT NULL,
	"message" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tables_seating" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"number" integer NOT NULL,
	"name" text,
	"capacity" integer DEFAULT 10 NOT NULL,
	"category" "table_category" DEFAULT 'amigos',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"type" varchar(20) DEFAULT 'ceremony' NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" varchar(10),
	"google_maps_url" text,
	"waze_url" text,
	"lat" varchar(20),
	"lng" varchar(20),
	"start_time" timestamp,
	"notes" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"invitation_id" uuid NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"duration" integer,
	"is_viewed_by_couple" boolean DEFAULT false NOT NULL,
	"recorded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "couple" ADD CONSTRAINT "couple_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_registries" ADD CONSTRAINT "gift_registries_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_guests" ADD CONSTRAINT "invitation_guests_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_table_id_tables_seating_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables_seating"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_folder_id_media_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."media_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications_log" ADD CONSTRAINT "notifications_log_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications_log" ADD CONSTRAINT "notifications_log_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tables_seating" ADD CONSTRAINT "tables_seating_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_messages" ADD CONSTRAINT "video_messages_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_messages" ADD CONSTRAINT "video_messages_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;