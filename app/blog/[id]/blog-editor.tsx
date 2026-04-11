"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface KeywordLink {
  text: string;
  url: string;
  index: number;
}

interface BlogEditorProps {
  blogId: number;
  htmlContent: string;
  onSave: (bodyHtml: string) => void;
}

export default function BlogEditor({
  blogId,
  htmlContent,
  onSave,
}: BlogEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<KeywordLink[]>([]);
  const [ready, setReady] = useState(false);

  // Toolbar
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [toolbarMode, setToolbarMode] = useState<"link" | "unlink" | "url-input">("link");
  const [urlValue, setUrlValue] = useState("https://www.dentalkart.com/");
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Saved state for link/unlink operations
  const savedRangeRef = useRef<Range | null>(null);
  const activeKwRef = useRef<HTMLAnchorElement | null>(null);

  // ── helpers ──────────────────────────────────────────
  const getDoc = () => iframeRef.current?.contentDocument ?? null;

  const getLinkText = (el: Element) => {
    let t = "";
    el.childNodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) t += n.textContent;
      else if (n.nodeType === Node.ELEMENT_NODE && !(n as HTMLElement).classList.contains("kw-x"))
        t += n.textContent;
    });
    return t.trim();
  };

  const scanKeywords = useCallback(() => {
    const d = getDoc();
    if (!d) return;
    const kws: KeywordLink[] = [];
    d.querySelectorAll("a.keyword-highlight").forEach((el, i) => {
      const text = getLinkText(el);
      if (text) kws.push({ text, url: (el as HTMLAnchorElement).href, index: i });
    });
    setKeywords(kws);
  }, []);

  const getCleanBody = useCallback(() => {
    const d = getDoc();
    if (!d?.body) return "";
    const clone = d.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".kw-x").forEach((b) => b.remove());
    return clone.innerHTML;
  }, []);

  // ── iframe init ────────────────────────────────────────
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => {
      const d = iframe.contentDocument;
      if (!d?.body) return;

      d.body.contentEditable = "true";
      d.body.style.outline = "none";
      d.execCommand("defaultParagraphSeparator", false, "p");

      // editor CSS
      const style = d.createElement("style");
      style.textContent = `
        body { min-height: 600px; }
        body:focus { outline: none !important; }
        .hero, .hero * { font-family: inherit; color: inherit; }
        .toc li { color: var(--dk-blue); font-weight: 600; font-size: 16px; }
        .section h2, .section h2 * { font-family: 'Inter',system-ui,sans-serif; color: var(--dk-dark,#1a1a2e); }
        .section-content, .section-content div, .section-content p, .section-content span {
          font-family: 'Inter',system-ui,sans-serif; font-size:16px; line-height:1.7; color:#333;
        }
        .blog-content, .blog-content div, .blog-content p {
          font-family: 'Inter',system-ui,sans-serif; line-height:1.7; color:#333;
        }
        .faq-question, .faq-question * { font-family: 'Inter',system-ui,sans-serif; color: var(--dk-dark,#1a1a2e); }
        .faq-answer, .faq-answer div, .faq-answer p, .faq-answer span {
          font-family: 'Inter',system-ui,sans-serif; font-size:16px; line-height:1.7; color:#333;
        }
        .cta-banner, .cta-banner * { font-family: inherit; color: inherit; }
        a.keyword-highlight { position: relative !important; cursor: text !important; }
        a.keyword-highlight .kw-x {
          display:none; position:absolute; top:-10px; right:-10px;
          width:22px; height:22px; background:#ef4444; color:#fff;
          border-radius:50%; font-size:14px; line-height:22px; text-align:center;
          cursor:pointer; z-index:100; box-shadow:0 2px 6px rgba(0,0,0,.3); user-select:none;
        }
        a.keyword-highlight:hover .kw-x { display:block; }
        a.keyword-highlight:hover { outline:2px solid #3b82f6 !important; outline-offset:2px !important; border-radius:4px; }
      `;
      d.head.appendChild(style);

      // inject x buttons
      d.querySelectorAll("a.keyword-highlight").forEach((el) => {
        if (el.querySelector(".kw-x")) return;
        const btn = d.createElement("span");
        btn.className = "kw-x";
        btn.textContent = "\u00d7";
        btn.setAttribute("contenteditable", "false");
        el.appendChild(btn);
      });

      // input
      d.body.addEventListener("input", () => {
        setHasChanges(true);
        setSaveStatus(null);
      });

      // clicks
      d.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("kw-x")) {
          e.preventDefault();
          e.stopPropagation();
          const link = target.closest("a.keyword-highlight");
          if (link?.parentNode) {
            const txt = d.createTextNode(getLinkText(link));
            link.parentNode.replaceChild(txt, link);
            setHasChanges(true);
            setSaveStatus(null);
          }
          return;
        }
        const a = target.closest("a");
        if (a) e.preventDefault();
      });

      // mouseup → detect selection, save range, show toolbar
      d.addEventListener("mouseup", () => {
        setTimeout(() => {
          const sel = d.getSelection();
          if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
            setShowToolbar(false);
            setToolbarMode("link");
            savedRangeRef.current = null;
            activeKwRef.current = null;
            return;
          }

          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width === 0) {
            setShowToolbar(false);
            return;
          }

          // SAVE the range so we can restore it when toolbar button is clicked
          savedRangeRef.current = range.cloneRange();

          const iRect = iframe.getBoundingClientRect();
          const sy = iframe.contentWindow?.scrollY || 0;

          setToolbarPos({
            top: iRect.top + rect.top - sy - 52 + window.scrollY,
            left: Math.max(
              iRect.left + 10,
              Math.min(iRect.left + rect.left + rect.width / 2 - 110, iRect.right - 280)
            ),
          });

          // is selection on a keyword link?
          const node = sel.anchorNode;
          const parent = node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
          const kw = parent?.closest("a.keyword-highlight") as HTMLAnchorElement | null;
          if (kw) {
            activeKwRef.current = kw;
            setToolbarMode("unlink");
          } else {
            activeKwRef.current = null;
            setToolbarMode("link");
          }
          setShowToolbar(true);
        }, 10);
      });

      // auto-resize
      const resize = () => {
        if (iframe && d.body) iframe.style.height = `${Math.max(d.body.scrollHeight + 40, 600)}px`;
      };
      resize();
      const obs = new MutationObserver(resize);
      obs.observe(d.body, { childList: true, subtree: true, characterData: true });

      setReady(true);
    };

    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [htmlContent]);

  // rescan keywords
  useEffect(() => {
    if (!ready) return;
    scanKeywords();
    const d = getDoc();
    if (!d?.body) return;
    const obs = new MutationObserver(() => scanKeywords());
    obs.observe(d.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [ready, scanKeywords]);

  // ── toolbar actions ────────────────────────────────────

  // Restore saved selection inside iframe
  const restoreSelection = useCallback(() => {
    const d = getDoc();
    const range = savedRangeRef.current;
    if (!d || !range) return false;
    const sel = d.getSelection();
    if (!sel) return false;
    sel.removeAllRanges();
    sel.addRange(range);
    return true;
  }, []);

  const handleAddLink = useCallback(() => {
    setToolbarMode("url-input");
    setUrlValue("https://www.dentalkart.com/");
    setTimeout(() => urlInputRef.current?.focus(), 50);
  }, []);

  const handleConfirmLink = useCallback(() => {
    const d = getDoc();
    if (!d || !urlValue.trim()) return;

    // Restore the saved selection
    if (!restoreSelection()) return;
    const sel = d.getSelection();
    if (!sel || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    const link = d.createElement("a");
    link.href = urlValue.trim();
    link.className = "keyword-highlight";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    try {
      range.surroundContents(link);
    } catch {
      const fragment = range.extractContents();
      link.appendChild(fragment);
      range.insertNode(link);
    }

    // Add x button
    const btn = d.createElement("span");
    btn.className = "kw-x";
    btn.textContent = "\u00d7";
    btn.setAttribute("contenteditable", "false");
    link.appendChild(btn);

    sel.removeAllRanges();
    savedRangeRef.current = null;
    setShowToolbar(false);
    setToolbarMode("link");
    setHasChanges(true);
    setSaveStatus(null);
  }, [urlValue, restoreSelection]);

  const handleUnlink = useCallback(() => {
    const d = getDoc();
    const kw = activeKwRef.current;
    if (!d || !kw?.parentNode) return;
    const txt = d.createTextNode(getLinkText(kw));
    kw.parentNode.replaceChild(txt, kw);
    activeKwRef.current = null;
    savedRangeRef.current = null;
    setShowToolbar(false);
    setToolbarMode("link");
    setHasChanges(true);
    setSaveStatus(null);
  }, []);

  const removeKeyword = useCallback((index: number) => {
    const d = getDoc();
    if (!d) return;
    const link = d.querySelectorAll("a.keyword-highlight")[index];
    if (!link?.parentNode) return;
    link.parentNode.replaceChild(d.createTextNode(getLinkText(link)), link);
    setHasChanges(true);
    setSaveStatus(null);
  }, []);

  const scrollToKeyword = useCallback((index: number) => {
    const d = getDoc();
    if (!d) return;
    const el = d.querySelectorAll("a.keyword-highlight")[index] as HTMLElement;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.style.outline = "3px solid #f59e0b";
    el.style.outlineOffset = "3px";
    setTimeout(() => { el.style.outline = ""; el.style.outlineOffset = ""; }, 2000);
  }, []);

  const handleSave = useCallback(async () => {
    const body = getCleanBody();
    if (!body) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch(`/api/blog/${blogId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlContent: body }),
      });
      const data = await res.json();
      if (data.success) {
        setHasChanges(false);
        setSaveStatus(`Saved (${data.wordCount} words)`);
        onSave(body);
      } else {
        setSaveStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setSaveStatus(`Error: ${err instanceof Error ? err.message : "Network error"}`);
    } finally {
      setSaving(false);
    }
  }, [blogId, getCleanBody, onSave]);

  // ── render ─────────────────────────────────────────────
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <h3 className="font-semibold text-sm">Editing</h3>
            {hasChanges && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saveStatus && (
              <span className={`text-xs px-2 py-1 rounded font-medium ${saveStatus.startsWith("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {saveStatus}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${!hasChanges || saving ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"}`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {keywords.length > 0 && (
          <div className="px-3 pb-3">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-700">Keyword Links ({keywords.length})</h4>
                <span className="text-xs text-slate-400">Click to locate | x to remove</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw) => (
                  <span key={`${kw.text}-${kw.index}`} className="inline-flex items-center bg-white border border-slate-200 rounded-md px-2 py-1 text-xs shadow-sm hover:border-blue-300 transition-colors">
                    <button onClick={() => scrollToKeyword(kw.index)} className="text-blue-600 font-medium hover:text-blue-800 mr-1.5 max-w-[200px] truncate" title={kw.url}>{kw.text}</button>
                    <button onClick={() => removeKeyword(kw.index)} className="text-slate-300 hover:text-red-500 transition-colors font-bold text-sm leading-none" title="Remove">x</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="px-3 py-2 border-t bg-gray-50 text-xs text-gray-400 flex gap-4">
          <span>Click text to edit</span>
          <span>Select text to link/unlink</span>
          <span>Hover keyword for x button</span>
        </div>
      </div>

      {/* Floating toolbar */}
      {showToolbar && (
        <div
          className="fixed z-[9999] bg-gray-900 text-white rounded-xl shadow-2xl px-3 py-2 flex items-center gap-2"
          style={{ top: toolbarPos.top, left: toolbarPos.left }}
        >
          {toolbarMode === "url-input" ? (
            <div className="flex items-center gap-2">
              <input
                ref={urlInputRef}
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmLink();
                  if (e.key === "Escape") { setToolbarMode("link"); setShowToolbar(false); }
                }}
                placeholder="https://www.dentalkart.com/c/..."
                className="bg-gray-800 text-white text-xs px-2.5 py-1.5 rounded w-72 border border-gray-600 focus:outline-none focus:border-blue-400"
              />
              <button onMouseDown={(e) => { e.preventDefault(); handleConfirmLink(); }} className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-600 font-semibold whitespace-nowrap">
                Link
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); setToolbarMode("link"); setShowToolbar(false); }} className="text-gray-400 hover:text-white text-xs">
                Esc
              </button>
            </div>
          ) : toolbarMode === "unlink" ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 mr-1">Keyword linked</span>
              <button onMouseDown={(e) => { e.preventDefault(); handleUnlink(); }} className="bg-red-500 text-white text-xs px-3 py-1.5 rounded hover:bg-red-600 font-semibold whitespace-nowrap">
                Unlink
              </button>
            </div>
          ) : (
            <button onMouseDown={(e) => { e.preventDefault(); handleAddLink(); }} className="text-xs px-2 py-1 hover:bg-gray-700 rounded font-medium">
              + Add Keyword Link
            </button>
          )}
        </div>
      )}

      {/* Editable iframe */}
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent}
        className="w-full border-0 block"
        style={{ minHeight: "600px" }}
        title="Blog editor"
      />
    </div>
  );
}
