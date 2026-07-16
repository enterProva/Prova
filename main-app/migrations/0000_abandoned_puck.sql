CREATE TABLE "feed_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" varchar,
	"content" text NOT NULL,
	"image_url" text,
	"link_check_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"likes_count" integer DEFAULT 0,
	"comments_count" integer DEFAULT 0,
	"shares_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "learning_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"lesson_id" varchar NOT NULL,
	"lesson_title" text NOT NULL,
	"category" varchar NOT NULL,
	"status" varchar NOT NULL,
	"progress_percent" integer DEFAULT 0,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "link_checks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"url" text NOT NULL,
	"title" text,
	"verdict" varchar NOT NULL,
	"credibility_score" integer,
	"bias_rating" varchar,
	"fact_check_score" integer,
	"sources_count" integer,
	"publication_date" timestamp,
	"checked_at" timestamp DEFAULT now(),
	"fact_check_sources" text[],
	"warnings" text[] DEFAULT ARRAY[]::text[],
	"is_public" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "pause_nudges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"nudge_type" varchar NOT NULL,
	"prompt" text NOT NULL,
	"response" varchar,
	"created_at" timestamp DEFAULT now(),
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"report_type" varchar NOT NULL,
	"target_url" text,
	"target_post_id" varchar,
	"description" text,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"links_checked" integer DEFAULT 0,
	"streak_days" integer DEFAULT 0,
	"trust_score" integer DEFAULT 50,
	"pause_count" integer DEFAULT 0,
	"mindful_shares" integer DEFAULT 0,
	"completed_lessons" integer DEFAULT 0,
	"last_active_date" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "feed_posts" ADD CONSTRAINT "feed_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_posts" ADD CONSTRAINT "feed_posts_link_check_id_link_checks_id_fk" FOREIGN KEY ("link_check_id") REFERENCES "public"."link_checks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_checks" ADD CONSTRAINT "link_checks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pause_nudges" ADD CONSTRAINT "pause_nudges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");