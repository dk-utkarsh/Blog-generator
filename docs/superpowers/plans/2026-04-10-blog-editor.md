# Blog Editor & Featured Image Preview — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an inline WYSIWYG editor to the blog detail page so users can edit text, remove/add DentalKart keyword links, and see the featured image before publishing.

**Architecture:** Replace the read-only iframe preview with a toggle between Edit and Preview modes. Edit mode renders the blog body HTML inside a `contentEditable` div with a floating toolbar for keyword link management. A new API route (`/api/blog/[id]/save`) persists edits back to the database. A separate API route (`/api/blog/[id]/featured-image`) serves the SVG preview.

**Tech Stack:** Next.js 16 App Router, React 19, contentEditable API, existing Tailwind CSS, sharp (already installed for featured image)

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `app/blog/[id]/blog-editor.tsx` | Client component: contentEditable editor with toolbar (edit text, remove/add keyword links) |
| Create | `app/blog/[id]/featured-image-preview.tsx` | Client component: shows the generated featured image SVG for this blog |
| Create | `app/api/blog/[id]/save/route.ts` | API route: saves edited HTML content back to DB |
| Create | `app/api/blog/[id]/featured-image/route.ts` | API route: generates and returns the featured image SVG for preview |
| Modify | `app/blog/[id]/page.tsx` | Wire up editor toggle (Edit/Preview), featured image preview, pass data to new components |
| Modify | `app/blog/[id]/copy-buttons.tsx` | Accept edited HTML content so publish pushes the edited version |

---

### Task 1: API route to save edited blog HTML

**Files:**
- Create: `app/api/blog/[id]/save/route.ts`

- [ ] **Step 1: Create the save API route**

```ts
// app/api/blog/[id]/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { blogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const blogId = parseInt(id, 10);
  if (isNaN(blogId)) {
    return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
  }

  const body = await request.json();
  const { htmlContent } = body;

  if (!htmlContent || typeof htmlContent !== "string") {
    return NextResponse.json({ error: "htmlContent is required" }, { status: 400 });
  }

  // Get existing blog to rebuild the full HTML document
  const result = await db
    .select({ htmlContent: blogs.htmlContent })
    .from(blogs)
    .where(eq(blogs.id, blogId))
    .limit(1);

  const blog = result[0];
  if (!blog || !blog.htmlContent) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  // Replace the body content in the full HTML document
  const updatedFullHtml = blog.htmlContent.replace(
    /(<body[^>]*>)([\s\S]*?)(<\/body>)/i,
    `$1${htmlContent}$3`
  );

  // Recalculate word count from the new content
  const textOnly = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = textOnly.split(" ").filter(Boolean).length;

  await db
    .update(blogs)
    .set({ htmlContent: updatedFullHtml, wordCount })
    .where(eq(blogs.id, blogId));

  return NextResponse.json({ success: true, wordCount });
}
```

- [ ] **Step 2: Test manually**

```bash
curl -X POST http://localhost:3000/api/blog/1/save \
  -H "Content-Type: application/json" \
  -d '{"htmlContent": "<p>test</p>"}'
```

Expected: `{"success": true, "wordCount": 1}`

- [ ] **Step 3: Commit**

```bash
git add app/api/blog/\[id\]/save/route.ts
git commit -m "feat: add API route to save edited blog HTML"
```

---

### Task 2: API route for featured image preview

**Files:**
- Create: `app/api/blog/[id]/featured-image/route.ts`

- [ ] **Step 1: Create the featured image API route**

```ts
// app/api/blog/[id]/featured-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { blogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { buildFeaturedImageSvg } from "@/lib/dentalkart/featured-image";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const blogId = parseInt(id, 10);
  if (isNaN(blogId)) {
    return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
  }

  const result = await db
    .select({
      title: blogs.title,
      subtitle: blogs.subtitle,
      category: blogs.category,
    })
    .from(blogs)
    .where(eq(blogs.id, blogId))
    .limit(1);

  const blog = result[0];
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  const svg = buildFeaturedImageSvg({
    title: blog.title,
    subtitle: blog.subtitle || undefined,
    category: blog.category || undefined,
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache",
    },
  });
}
```

- [ ] **Step 2: Test by opening in browser**

Open `http://localhost:3000/api/blog/1/featured-image` — should render the branded SVG image.

- [ ] **Step 3: Commit**

```bash
git add app/api/blog/\[id\]/featured-image/route.ts
git commit -m "feat: add API route for featured image SVG preview"
```

---

### Task 3: Featured image preview component

**Files:**
- Create: `app/blog/[id]/featured-image-preview.tsx`

- [ ] **Step 1: Create the featured image preview component**

```tsx
// app/blog/[id]/featured-image-preview.tsx
"use client";

interface FeaturedImagePreviewProps {
  blogId: number;
}

export default function FeaturedImagePreview({ blogId }: FeaturedImagePreviewProps) {
  return (
    <div className="mb-6 bg-white rounded-lg border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Featured Image</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Auto-generated from title. This image is uploaded when you publish to DentalKart.
        </p>
      </div>
      <div className="p-4 flex justify-center bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/blog/${blogId}/featured-image`}
          alt="Featured image preview"
          className="rounded-lg shadow-sm max-w-full"
          style={{ maxHeight: "315px" }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/blog/\[id\]/featured-image-preview.tsx
git commit -m "feat: add featured image preview component"
```

---

### Task 4: Blog editor component

This is the core component. It renders the blog body HTML in a `contentEditable` div with:
- Direct text editing (type, delete, backspace — all native)
- Keyword links shown with a visible remove (x) button on hover
- A floating toolbar when text is selected: "Add Keyword Link" button that prompts for a URL
- Save button to persist changes

**Files:**
- Create: `app/blog/[id]/blog-editor.tsx`

- [ ] **Step 1: Create the blog editor component**

```tsx
// app/blog/[id]/blog-editor.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface BlogEditorProps {
  blogId: number;
  initialHtml: string;
  styles: string;
  onSave: (html: string) => void;
}

export default function BlogEditor({
  blogId,
  initialHtml,
  styles,
  onSave,
}: BlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Floating toolbar state
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("https://www.dentalkart.com/");
  const savedSelectionRef = useRef<Range | null>(null);

  // Track changes
  const handleInput = useCallback(() => {
    setHasChanges(true);
    setSaveStatus(null);
  }, []);

  // Show floating toolbar on text selection
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (
      selection &&
      !selection.isCollapsed &&
      editorRef.current?.contains(selection.anchorNode)
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const editorRect = editorRef.current!.getBoundingClientRect();
      setToolbarPos({
        top: rect.top - editorRect.top - 48,
        left: rect.left - editorRect.left + rect.width / 2 - 80,
      });
      setShowToolbar(true);
    } else {
      // Small delay so button clicks register before hiding
      setTimeout(() => {
        setShowToolbar(false);
        setShowUrlInput(false);
      }, 200);
    }
  }, []);

  // Add keyword link to selection
  const handleAddLink = useCallback(() => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
      setShowUrlInput(true);
      setUrlValue("https://www.dentalkart.com/");
    }
  }, []);

  const handleConfirmLink = useCallback(() => {
    const range = savedSelectionRef.current;
    if (!range || !urlValue.trim()) return;

    // Restore selection
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Create the keyword link
    const link = document.createElement("a");
    link.href = urlValue.trim();
    link.className = "keyword-highlight";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    try {
      range.surroundContents(link);
    } catch {
      // If selection spans multiple elements, use extractContents
      const fragment = range.extractContents();
      link.appendChild(fragment);
      range.insertNode(link);
    }

    setShowToolbar(false);
    setShowUrlInput(false);
    setHasChanges(true);
    setSaveStatus(null);
    selection?.removeAllRanges();
  }, [urlValue]);

  // Remove a keyword link (unlink back to plain text)
  const handleRemoveLink = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("kw-remove-btn")) {
      e.preventDefault();
      e.stopPropagation();
      const link = target.closest("a.keyword-highlight");
      if (link && link.parentNode) {
        // Replace link with its text content
        const text = document.createTextNode(link.textContent || "");
        link.parentNode.replaceChild(text, link);
        setHasChanges(true);
        setSaveStatus(null);
      }
    }
  }, []);

  // Save edited content
  const handleSave = useCallback(async () => {
    if (!editorRef.current) return;
    setSaving(true);
    setSaveStatus(null);

    // Clone the editor HTML and strip out the remove buttons before saving
    const clone = editorRef.current.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".kw-remove-btn").forEach((btn) => btn.remove());
    const editedHtml = clone.innerHTML;

    try {
      const res = await fetch(`/api/blog/${blogId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlContent: editedHtml }),
      });
      const data = await res.json();
      if (data.success) {
        setHasChanges(false);
        setSaveStatus(`Saved (${data.wordCount} words)`);
        onSave(editedHtml);
      } else {
        setSaveStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setSaveStatus(`Error: ${err instanceof Error ? err.message : "Network error"}`);
    } finally {
      setSaving(false);
    }
  }, [blogId, onSave]);

  // Inject remove buttons into keyword links on mount
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.querySelectorAll("a.keyword-highlight").forEach((link) => {
      if (!link.querySelector(".kw-remove-btn")) {
        const btn = document.createElement("span");
        btn.className = "kw-remove-btn";
        btn.textContent = "\u00d7";
        btn.title = "Remove this keyword link";
        link.appendChild(btn);
      }
    });
  }, []);

  return (
    <div className="bg-white rounded-lg border">
      {/* Toolbar */}
      <div className="p-3 border-b flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">Edit Blog</h3>
          <span className="text-xs text-gray-400">
            Click to edit text. Hover keywords to remove. Select text to add links.
          </span>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span
              className={`text-xs px-2 py-1 rounded ${
                saveStatus.startsWith("Error")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {saveStatus}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              !hasChanges || saving
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="relative">
        {/* Floating selection toolbar */}
        {showToolbar && (
          <div
            className="absolute z-50 bg-gray-900 text-white rounded-lg shadow-xl px-2 py-1.5 flex items-center gap-2"
            style={{ top: toolbarPos.top, left: toolbarPos.left }}
          >
            {showUrlInput ? (
              <div className="flex items-center gap-1">
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmLink();
                    if (e.key === "Escape") {
                      setShowUrlInput(false);
                      setShowToolbar(false);
                    }
                  }}
                  placeholder="https://www.dentalkart.com/..."
                  className="bg-gray-800 text-white text-xs px-2 py-1 rounded w-64 border border-gray-600 focus:outline-none focus:border-blue-400"
                  autoFocus
                />
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleConfirmLink();
                  }}
                  className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAddLink();
                }}
                className="text-xs px-2 py-0.5 hover:bg-gray-700 rounded"
              >
                + Add Keyword Link
              </button>
            )}
          </div>
        )}

        {/* Scoped styles + content */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              ${styles}
              .blog-editor-content a.keyword-highlight {
                position: relative;
                cursor: default;
              }
              .blog-editor-content a.keyword-highlight .kw-remove-btn {
                display: none;
                position: absolute;
                top: -8px;
                right: -8px;
                width: 18px;
                height: 18px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                font-size: 12px;
                line-height: 18px;
                text-align: center;
                cursor: pointer;
                z-index: 10;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
              }
              .blog-editor-content a.keyword-highlight:hover .kw-remove-btn {
                display: block;
              }
              .blog-editor-content a.keyword-highlight:hover {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
                border-radius: 4px;
              }
              .blog-editor-content:focus {
                outline: none;
              }
            `,
          }}
        />
        <div
          ref={editorRef}
          className="blog-editor-content p-6"
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: initialHtml }}
          onInput={handleInput}
          onMouseUp={handleMouseUp}
          onClick={handleRemoveLink}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/blog/\[id\]/blog-editor.tsx
git commit -m "feat: add WYSIWYG blog editor with keyword link management"
```

---

### Task 5: Wire up the blog detail page

Replace the read-only iframe with a toggle between Edit and Preview modes. Add the featured image preview above the publish buttons.

**Files:**
- Modify: `app/blog/[id]/page.tsx`
- Modify: `app/blog/[id]/copy-buttons.tsx`

- [ ] **Step 1: Update copy-buttons.tsx to accept optional edited HTML**

In `app/blog/[id]/copy-buttons.tsx`, change the component to accept an optional `editedHtml` prop that overrides `htmlContent` when present. The push to DentalKart should use the edited version.

Add to the `CopyButtonsProps` interface:

```ts
interface CopyButtonsProps {
  blogId: number;
  title: string;
  htmlContent: string;
  excerpt: string;
  slug: string;
  category: string;
  editedBodyHtml?: string; // If present, use this for push instead of original
}
```

Update the component signature to accept `editedBodyHtml` and use it for the body content extraction:

```tsx
export default function CopyButtons({
  blogId,
  title,
  htmlContent,
  excerpt,
  slug,
  category,
  editedBodyHtml,
}: CopyButtonsProps) {
```

Replace the body content extraction logic:

```tsx
  // Use edited content if available, otherwise extract from original
  const bodyContent = editedBodyHtml
    ? editedBodyHtml
    : (() => {
        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        return bodyMatch ? bodyMatch[1] : htmlContent;
      })();

  // Extract style content for the full HTML with styles
  const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  const styles = styleMatch ? styleMatch.join("\n") : "";
  const fullHtmlForEditor = `${styles}\n${bodyContent}`;
```

The rest of the file stays the same — `fullHtmlForEditor` is already used for copy and push operations.

- [ ] **Step 2: Rewrite the blog detail page with edit/preview toggle**

Replace the full content of `app/blog/[id]/page.tsx`:

```tsx
// app/blog/[id]/page.tsx
import { db } from "@/lib/db/client";
import { blogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import BlogDetailClient from "./blog-detail-client";

export const dynamic = "force-dynamic";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blogId = parseInt(id, 10);
  if (isNaN(blogId)) notFound();

  const result = await db
    .select()
    .from(blogs)
    .where(eq(blogs.id, blogId))
    .limit(1);

  const blog = result[0];
  if (!blog) notFound();

  const slug = blog.title
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Extract body and styles from full HTML
  const bodyMatch = blog.htmlContent?.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : "";
  const styleMatch = blog.htmlContent?.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  const styles = styleMatch ? styleMatch.join("\n") : "";

  return (
    <div>
      <Link
        href="/"
        className="text-blue-600 text-sm hover:underline mb-4 inline-block"
      >
        &larr; Back to all blogs
      </Link>

      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-mono text-gray-400">
            Blog #{blog.blogNumber}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              blog.status === "generated"
                ? "bg-green-100 text-green-700"
                : blog.status === "failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {blog.status}
          </span>
        </div>
        <h2 className="text-xl font-bold mb-1">{blog.title}</h2>
        {blog.subtitle && (
          <p className="text-gray-500 text-sm">{blog.subtitle}</p>
        )}

        <div className="flex gap-4 mt-3 text-sm text-gray-500">
          {blog.category && <span>Category: {blog.category}</span>}
          {blog.contentType && <span>Type: {blog.contentType}</span>}
          {blog.wordCount && <span>{blog.wordCount} words</span>}
          {blog.createdAt && (
            <span>
              {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {blog.errorMessage && (
          <div className="mt-3 p-3 bg-red-50 rounded text-red-700 text-sm">
            Error: {blog.errorMessage}
          </div>
        )}
      </div>

      {blog.htmlContent ? (
        <BlogDetailClient
          blogId={blog.id}
          title={blog.title}
          htmlContent={blog.htmlContent}
          bodyHtml={bodyHtml}
          styles={styles}
          excerpt={blog.subtitle || ""}
          slug={slug || ""}
          category={blog.category || ""}
        />
      ) : (
        blog.markdownContent && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-sm mb-3">Markdown Content</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {blog.markdownContent}
            </pre>
          </div>
        )
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create the client wrapper that manages edit/preview toggle and edited state**

Create `app/blog/[id]/blog-detail-client.tsx`:

```tsx
// app/blog/[id]/blog-detail-client.tsx
"use client";

import { useState, useCallback } from "react";
import CopyButtons from "./copy-buttons";
import BlogEditor from "./blog-editor";
import FeaturedImagePreview from "./featured-image-preview";

interface BlogDetailClientProps {
  blogId: number;
  title: string;
  htmlContent: string;
  bodyHtml: string;
  styles: string;
  excerpt: string;
  slug: string;
  category: string;
}

export default function BlogDetailClient({
  blogId,
  title,
  htmlContent,
  bodyHtml,
  styles,
  excerpt,
  slug,
  category,
}: BlogDetailClientProps) {
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [editedBodyHtml, setEditedBodyHtml] = useState<string | null>(null);
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const handleSave = useCallback((html: string) => {
    setEditedBodyHtml(html);
  }, []);

  return (
    <>
      {/* Featured Image Preview */}
      <FeaturedImagePreview blogId={blogId} />

      {/* Copy / Publish buttons — pass edited HTML if available */}
      <CopyButtons
        blogId={blogId}
        title={title}
        htmlContent={htmlContent}
        excerpt={excerpt}
        slug={slug}
        category={category}
        editedBodyHtml={editedBodyHtml || undefined}
      />

      {/* Edit / Preview toggle */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setMode("preview")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            mode === "preview"
              ? "bg-white shadow text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setMode("edit")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            mode === "edit"
              ? "bg-white shadow text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Edit
        </button>
      </div>

      {mode === "edit" ? (
        <BlogEditor
          blogId={blogId}
          initialHtml={editedBodyHtml || bodyHtml}
          styles={styles}
          onSave={handleSave}
        />
      ) : (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-sm">Blog Preview</h3>
            <span className="text-xs text-gray-400">HTML output</span>
          </div>
          <iframe
            srcDoc={htmlContent.replace(
              "<head>",
              `<head><base href="${baseUrl}/" />`
            )}
            className="w-full border-0"
            style={{ minHeight: "800px" }}
            title="Blog preview"
          />
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Verify in the browser**

Open `http://localhost:3000/blog/<id>` — verify:
- Featured image shows above the publish buttons
- Toggle switches between Preview (iframe) and Edit (contentEditable)
- In Edit mode: can type text, hover keyword links shows red (x), selecting text shows floating toolbar
- "Add Keyword Link" opens URL input, pressing "Add" wraps the selected text
- "Save Changes" button lights up when changes are made, saves successfully
- After saving, switching to Preview shows the updated content
- Publish/Draft buttons push the edited version

- [ ] **Step 5: Commit**

```bash
git add app/blog/\[id\]/page.tsx app/blog/\[id\]/blog-detail-client.tsx app/blog/\[id\]/copy-buttons.tsx
git commit -m "feat: wire up edit/preview toggle with featured image preview"
```

---

### Task 6: End-to-end verification

- [ ] **Step 1: Test the full flow**

1. Open `http://localhost:3000`
2. Click into an existing blog (or generate a new one)
3. See the featured image preview at the top
4. Switch to Edit mode
5. Edit some text in the blog body
6. Hover a keyword link — click the red (x) to remove it
7. Select a word — click "Add Keyword Link" in the floating toolbar — enter a DentalKart URL — click "Add"
8. Click "Save Changes" — should show "Saved (N words)"
9. Switch to Preview — verify edits are reflected in the iframe
10. Click "Push as Draft" — verify it sends the edited content to DentalKart

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat: blog editor with keyword link management and featured image preview"
```
