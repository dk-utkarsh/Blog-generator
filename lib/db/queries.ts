import { db } from "./client";
import { blogs, researchSources } from "./schema";
import { desc, eq, sql } from "drizzle-orm";

export async function getRecentBlogs(limit = 20) {
  return db.select().from(blogs).orderBy(desc(blogs.createdAt)).limit(limit);
}

export async function getNextBlogNumber() {
  const result = await db
    .select({ max: sql<number>`COALESCE(MAX(${blogs.blogNumber}), 0)` })
    .from(blogs);
  return (result[0]?.max ?? 0) + 1;
}

export async function getLastBlogWithinHours(hours: number) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const result = await db
    .select()
    .from(blogs)
    .where(sql`${blogs.createdAt} > ${cutoff} AND ${blogs.status} != 'failed'`)
    .limit(1);
  return result[0] ?? null;
}

export async function saveBlog(data: typeof blogs.$inferInsert) {
  const result = await db.insert(blogs).values(data).returning();
  return result[0];
}

export async function updateBlogStatus(
  id: number,
  status: string,
  errorMessage?: string
) {
  await db
    .update(blogs)
    .set({ status, errorMessage })
    .where(eq(blogs.id, id));
}

export async function saveResearchSource(
  data: typeof researchSources.$inferInsert
) {
  await db.insert(researchSources).values(data);
}
