import {
  pgTable,
  serial,
  integer,
  text,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const blogs = pgTable("blogs", {
  id: serial("id").primaryKey(),
  blogNumber: integer("blog_number").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  category: text("category"),
  contentType: text("content_type"),
  keywords: text("keywords").array(),
  searchKeyword: text("search_keyword"),
  markdownContent: text("markdown_content"),
  htmlContent: text("html_content"),
  images: jsonb("images").$type<
    { url: string; caption: string; prompt: string }[]
  >(),
  productsUsed: jsonb("products_used").$type<
    { name: string; url: string; brand: string; positioning: string }[]
  >(),
  wordCount: integer("word_count"),
  status: text("status").notNull().default("generated"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});

export const researchSources = pgTable("research_sources", {
  id: serial("id").primaryKey(),
  blogId: integer("blog_id").references(() => blogs.id),
  sourceType: text("source_type").notNull(),
  rawData: jsonb("raw_data"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow(),
});
