CREATE TABLE "blogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"blog_number" integer NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"category" text,
	"content_type" text,
	"keywords" text[],
	"search_keyword" text,
	"markdown_content" text,
	"html_content" text,
	"images" jsonb,
	"products_used" jsonb,
	"word_count" integer,
	"status" text DEFAULT 'generated' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "research_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"blog_id" integer,
	"source_type" text NOT NULL,
	"raw_data" jsonb,
	"fetched_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "research_sources" ADD CONSTRAINT "research_sources_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE no action ON UPDATE no action;