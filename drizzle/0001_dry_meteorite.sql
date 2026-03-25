CREATE TABLE "upload_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"slug" text,
	"phase" text NOT NULL,
	"status" varchar(10) DEFAULT 'ok' NOT NULL,
	"message" text,
	"details" text,
	"error_msg" text,
	"error_stack" text
);
