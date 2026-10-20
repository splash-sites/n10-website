import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'fr', 'nl');
  CREATE TYPE "public"."enum_players_position" AS ENUM('goalkeeper', 'right-back', 'centre-back', 'left-back', 'defensive-midfielder', 'central-midfielder', 'attacking-midfielder', 'right-winger', 'left-winger', 'striker');
  CREATE TYPE "public"."enum_players_foot" AS ENUM('left', 'right', 'both');
  CREATE TYPE "public"."enum_posts_category" AS ENUM('signing', 'news', 'insight', 'opinion', 'agency');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('signing', 'news', 'insight', 'opinion', 'agency');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('en', 'fr', 'nl');
  CREATE TYPE "public"."enum_messages_status" AS ENUM('new', 'handled', 'archived');
  CREATE TYPE "public"."enum_messages_sender_type" AS ENUM('player', 'family', 'club', 'brand', 'partner');
  CREATE TYPE "public"."enum_home_stats_source" AS ENUM('players', 'nationalities', 'leagues', 'custom');
  CREATE TYPE "public"."enum_home_cta_players_preselect" AS ENUM('player', 'family', 'club', 'brand', 'partner');
  CREATE TYPE "public"."enum_home_cta_clubs_preselect" AS ENUM('player', 'family', 'club', 'brand', 'partner');
  CREATE TABLE "players" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"shirt_number" numeric NOT NULL,
  	"position" "enum_players_position" NOT NULL,
  	"foot" "enum_players_foot",
  	"height_cm" numeric,
  	"birth_date" timestamp(3) with time zone NOT NULL,
  	"current_club" varchar NOT NULL,
  	"league" varchar,
  	"contract_until" timestamp(3) with time zone,
  	"joined_agency" timestamp(3) with time zone,
  	"portrait_id" integer NOT NULL,
  	"action_photo_id" integer,
  	"transfermarkt_url" varchar,
  	"instagram_handle" varchar,
  	"highlights_url" varchar,
  	"slug" varchar,
  	"published" boolean DEFAULT false,
  	"show_on_wall" boolean DEFAULT true,
  	"featured" boolean DEFAULT false,
  	"minor_consent" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "players_locales" (
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "players_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "players_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cover_id" integer,
  	"slug" varchar,
  	"category" "enum_posts_category" DEFAULT 'news',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"players_id" integer
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_cover_id" integer,
  	"version_slug" varchar,
  	"version_category" "enum__posts_v_version_category" DEFAULT 'news',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__posts_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"players_id" integer
  );
  
  CREATE TABLE "team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"photo_id" integer,
  	"languages" varchar,
  	"linkedin_url" varchar,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "team_locales" (
  	"role" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_messages_status" DEFAULT 'new',
  	"sender_type" "enum_messages_sender_type" NOT NULL,
  	"locale" varchar,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"organisation" varchar,
  	"role" varchar,
  	"website" varchar,
  	"position" varchar,
  	"current_club" varchar,
  	"message" varchar NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"players_id" integer,
  	"posts_id" integer,
  	"team_id" integer,
  	"media_id" integer,
  	"messages_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_home_stats_source" DEFAULT 'custom' NOT NULL,
  	"value" numeric
  );
  
  CREATE TABLE "home_stats_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "home_steps_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_quotes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"photo_id" integer
  );
  
  CREATE TABLE "home_quotes_locales" (
  	"quote" varchar NOT NULL,
  	"role" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"hero_player_id" integer,
  	"show_facts" boolean DEFAULT true,
  	"cta_players_preselect" "enum_home_cta_players_preselect",
  	"cta_clubs_preselect" "enum_home_cta_clubs_preselect",
  	"talents_show" boolean DEFAULT true,
  	"clubs_show" boolean DEFAULT true,
  	"services_show" boolean DEFAULT true,
  	"process_show" boolean DEFAULT true,
  	"quotes_section_show" boolean DEFAULT true,
  	"team_show" boolean DEFAULT true,
  	"journal_show" boolean DEFAULT true,
  	"instagram_show" boolean DEFAULT true,
  	"ctas_show" boolean DEFAULT true,
  	"contact_show" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_locales" (
  	"headline" varchar DEFAULT 'Careers
  built for
  the long run',
  	"badge_label" varchar DEFAULT 'New',
  	"badge_text" varchar,
  	"intro_bold" varchar,
  	"intro_text" varchar,
  	"cta_primary" varchar DEFAULT 'See our talents',
  	"cta_secondary" varchar DEFAULT 'Talk to an agent',
  	"cta_players_eyebrow" varchar,
  	"cta_players_title" varchar,
  	"cta_players_text" varchar,
  	"cta_clubs_eyebrow" varchar,
  	"cta_clubs_title" varchar,
  	"cta_clubs_text" varchar,
  	"talents_eyebrow" varchar,
  	"talents_title" varchar,
  	"talents_intro" varchar,
  	"clubs_title" varchar,
  	"services_eyebrow" varchar,
  	"services_title" varchar,
  	"services_intro" varchar,
  	"process_eyebrow" varchar,
  	"process_title" varchar,
  	"process_intro" varchar,
  	"quotes_section_eyebrow" varchar,
  	"quotes_section_title" varchar,
  	"team_eyebrow" varchar,
  	"team_title" varchar,
  	"team_intro" varchar,
  	"journal_eyebrow" varchar,
  	"journal_title" varchar,
  	"journal_intro" varchar,
  	"instagram_eyebrow" varchar,
  	"instagram_title" varchar,
  	"instagram_intro" varchar,
  	"ctas_eyebrow" varchar,
  	"ctas_title" varchar,
  	"contact_eyebrow" varchar,
  	"contact_title" varchar,
  	"contact_intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "services_items_locales" (
  	"tag" varchar,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"contact_email" varchar DEFAULT 'contact@numero10.com' NOT NULL,
  	"phone" varchar,
  	"fifa_licence" varchar,
  	"instagram_handle" varchar,
  	"linkedin_url" varchar,
  	"email_notifications" boolean DEFAULT true,
  	"notify_emails" varchar,
  	"behold_feed_id" varchar,
  	"share_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "settings_locales" (
  	"office" varchar DEFAULT 'Brussels, Belgium',
  	"seo_title" varchar DEFAULT 'Numéro 10, football agency',
  	"seo_description" varchar DEFAULT 'FIFA-licensed football agency in Belgium. Player representation, career strategy and partnerships.',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "settings_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "privacy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_on" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "privacy_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "players" ADD CONSTRAINT "players_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "players" ADD CONSTRAINT "players_action_photo_id_media_id_fk" FOREIGN KEY ("action_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "players_locales" ADD CONSTRAINT "players_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players_texts" ADD CONSTRAINT "players_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players_rels" ADD CONSTRAINT "players_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players_rels" ADD CONSTRAINT "players_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_locales" ADD CONSTRAINT "team_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stats" ADD CONSTRAINT "home_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stats_locales" ADD CONSTRAINT "home_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_steps" ADD CONSTRAINT "home_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_steps_locales" ADD CONSTRAINT "home_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_quotes" ADD CONSTRAINT "home_quotes_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_quotes" ADD CONSTRAINT "home_quotes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_quotes_locales" ADD CONSTRAINT "home_quotes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_quotes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_player_id_players_id_fk" FOREIGN KEY ("hero_player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_locales" ADD CONSTRAINT "home_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_items" ADD CONSTRAINT "services_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_items" ADD CONSTRAINT "services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_items_locales" ADD CONSTRAINT "services_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_share_image_id_media_id_fk" FOREIGN KEY ("share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "settings_locales" ADD CONSTRAINT "settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_texts" ADD CONSTRAINT "settings_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "privacy_locales" ADD CONSTRAINT "privacy_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."privacy"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "players__order_idx" ON "players" USING btree ("_order");
  CREATE INDEX "players_portrait_idx" ON "players" USING btree ("portrait_id");
  CREATE INDEX "players_action_photo_idx" ON "players" USING btree ("action_photo_id");
  CREATE UNIQUE INDEX "players_slug_idx" ON "players" USING btree ("slug");
  CREATE INDEX "players_updated_at_idx" ON "players" USING btree ("updated_at");
  CREATE INDEX "players_created_at_idx" ON "players" USING btree ("created_at");
  CREATE UNIQUE INDEX "players_locales_locale_parent_id_unique" ON "players_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "players_locales_parent_id_idx" ON "players_locales" USING btree ("_parent_id");
  CREATE INDEX "players_texts_order_parent" ON "players_texts" USING btree ("order","parent_id");
  CREATE INDEX "players_rels_order_idx" ON "players_rels" USING btree ("order");
  CREATE INDEX "players_rels_parent_idx" ON "players_rels" USING btree ("parent_id");
  CREATE INDEX "players_rels_path_idx" ON "players_rels" USING btree ("path");
  CREATE INDEX "players_rels_media_id_idx" ON "players_rels" USING btree ("media_id");
  CREATE INDEX "posts_cover_idx" ON "posts" USING btree ("cover_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_locales_parent_id_idx" ON "posts_locales" USING btree ("_parent_id");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_players_id_idx" ON "posts_rels" USING btree ("players_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_cover_idx" ON "_posts_v" USING btree ("version_cover_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_locales_parent_id_idx" ON "_posts_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_players_id_idx" ON "_posts_v_rels" USING btree ("players_id");
  CREATE INDEX "team__order_idx" ON "team" USING btree ("_order");
  CREATE INDEX "team_photo_idx" ON "team" USING btree ("photo_id");
  CREATE INDEX "team_updated_at_idx" ON "team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "team" USING btree ("created_at");
  CREATE UNIQUE INDEX "team_locales_locale_parent_id_unique" ON "team_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "team_locales_parent_id_idx" ON "team_locales" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_players_id_idx" ON "payload_locked_documents_rels" USING btree ("players_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_stats_order_idx" ON "home_stats" USING btree ("_order");
  CREATE INDEX "home_stats_parent_id_idx" ON "home_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_stats_locales_locale_parent_id_unique" ON "home_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_stats_locales_parent_id_idx" ON "home_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "home_steps_order_idx" ON "home_steps" USING btree ("_order");
  CREATE INDEX "home_steps_parent_id_idx" ON "home_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_steps_locales_locale_parent_id_unique" ON "home_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_steps_locales_parent_id_idx" ON "home_steps_locales" USING btree ("_parent_id");
  CREATE INDEX "home_quotes_order_idx" ON "home_quotes" USING btree ("_order");
  CREATE INDEX "home_quotes_parent_id_idx" ON "home_quotes" USING btree ("_parent_id");
  CREATE INDEX "home_quotes_photo_idx" ON "home_quotes" USING btree ("photo_id");
  CREATE UNIQUE INDEX "home_quotes_locales_locale_parent_id_unique" ON "home_quotes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_quotes_locales_parent_id_idx" ON "home_quotes_locales" USING btree ("_parent_id");
  CREATE INDEX "home_hero_image_idx" ON "home" USING btree ("hero_image_id");
  CREATE INDEX "home_hero_player_idx" ON "home" USING btree ("hero_player_id");
  CREATE UNIQUE INDEX "home_locales_locale_parent_id_unique" ON "home_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_locales_parent_id_idx" ON "home_locales" USING btree ("_parent_id");
  CREATE INDEX "services_items_order_idx" ON "services_items" USING btree ("_order");
  CREATE INDEX "services_items_parent_id_idx" ON "services_items" USING btree ("_parent_id");
  CREATE INDEX "services_items_image_idx" ON "services_items" USING btree ("image_id");
  CREATE UNIQUE INDEX "services_items_locales_locale_parent_id_unique" ON "services_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_items_locales_parent_id_idx" ON "services_items_locales" USING btree ("_parent_id");
  CREATE INDEX "settings_share_image_idx" ON "settings" USING btree ("share_image_id");
  CREATE UNIQUE INDEX "settings_locales_locale_parent_id_unique" ON "settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "settings_locales_parent_id_idx" ON "settings_locales" USING btree ("_parent_id");
  CREATE INDEX "settings_texts_order_parent" ON "settings_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "privacy_locales_locale_parent_id_unique" ON "privacy_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "privacy_locales_parent_id_idx" ON "privacy_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "players" CASCADE;
  DROP TABLE "players_locales" CASCADE;
  DROP TABLE "players_texts" CASCADE;
  DROP TABLE "players_rels" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "team" CASCADE;
  DROP TABLE "team_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "messages" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_stats" CASCADE;
  DROP TABLE "home_stats_locales" CASCADE;
  DROP TABLE "home_steps" CASCADE;
  DROP TABLE "home_steps_locales" CASCADE;
  DROP TABLE "home_quotes" CASCADE;
  DROP TABLE "home_quotes_locales" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_locales" CASCADE;
  DROP TABLE "services_items" CASCADE;
  DROP TABLE "services_items_locales" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TABLE "settings_locales" CASCADE;
  DROP TABLE "settings_texts" CASCADE;
  DROP TABLE "privacy" CASCADE;
  DROP TABLE "privacy_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_players_position";
  DROP TYPE "public"."enum_players_foot";
  DROP TYPE "public"."enum_posts_category";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_category";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum_messages_status";
  DROP TYPE "public"."enum_messages_sender_type";
  DROP TYPE "public"."enum_home_stats_source";
  DROP TYPE "public"."enum_home_cta_players_preselect";
  DROP TYPE "public"."enum_home_cta_clubs_preselect";`)
}
