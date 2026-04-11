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
  const [iframeReady, setIframeReady] = useState(false);

  // Floating toolbar
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("https://www.dentalkart.com/");
  const urlInputRef = useRef<HTMLInputElement>(null);

  const getDoc = useCallback(() => {
    return iframeRef.current?.contentDocument || null;
  }, []);

  // Scan keyword links
  const scanKeywords = useCallback(() => {
    const doc = getDoc();
    if (!doc) return;
    const links = doc.querySelectorAll("a.keyword-highlight");
    const kws: KeywordLink[] = [];
    links.forEach((el, i) => {
      const a = el as HTMLAnchorElement;
      // Get text without the remove button text
      let text = "";
      a.childNodes.forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) text += n.textContent;
        else if (
          n.nodeType === Node.ELEMENT_NODE &&
          !(n as HTMLElement).classList.contains("kw-x")
        )
          text += n.textContent;
      });
      text = text.trim();
      if (text) kws.push({ text, url: a.href, index: i });
    });
    setKeywords(kws);
  }, [getDoc]);

  // Get clean body HTML (strips editor artifacts)
  const getCleanBodyHtml = useCallback(() => {
    const doc = getDoc();
    if (!doc?.body) return "";
    const clone = doc.body.cloneNode(true) as HTMLElement;
    // Remove all injected remove buttons
    clone.querySelectorAll(".kw-x").forEach((b) => b.remove());
    return clone.innerHTML;
  }, [getDoc]);

  // Inject remove buttons into keyword links
  const injectRemoveButtons = useCallback(() => {
    const doc = getDoc();
    if (!doc) return;
    doc.querySelectorAll("a.keyword-highlight").forEach((el) => {
      if (el.querySelector(".kw-x")) return;
      const btn = doc.createElement("span");
      btn.className = "kw-x";
      btn.textContent = "\u00d7";
      btn.setAttribute("contenteditable", "false");
      el.appendChild(btn);
    });
  }, [getDoc]);

  // Remove a keyword link by index
  const removeKeyword = useCallback(
    (index: number) => {
      const doc = getDoc();
      if (!doc) return;
      const links = doc.querySelectorAll("a.keyword-highlight");
      const link = links[index] as HTMLAnchorElement;
      if (!link || !link.parentNode) return;
      // Get text without remove button
      let text = "";
      link.childNodes.forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) text += n.textContent;
        else if (
          n.nodeType === Node.ELEMENT_NODE &&
          !(n as HTMLElement).classList.contains("kw-x")
        )
          text += n.textContent;
      });
      const textNode = doc.createTextNode(text.trim());
      link.parentNode.replaceChild(textNode, link);
      setHasChanges(true);
      setSaveStatus(null);
      scanKeywords();
    },
    [getDoc, scanKeywords]
  );

  // Scroll to keyword
  const scrollToKeyword = useCallback(
    (index: number) => {
      const doc = getDoc();
      if (!doc) return;
      const links = doc.querySelectorAll("a.keyword-highlight");
      const el = links[index] as HTMLElement;
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.outline = "3px solid #f59e0b";
      el.style.outlineOffset = "3px";
      setTimeout(() => {
        el.style.outline = "";
        el.style.outlineOffset = "";
      }, 2000);
    },
    [getDoc]
  );

  // Initialize editable iframe
  const handleIframeLoad = useCallback(() => {
    const doc = getDoc();
    if (!doc?.body) return;

    doc.body.contentEditable = "true";
    doc.body.style.outline = "none";

    // Editor styles
    const s = doc.createElement("style");
    s.textContent = `
      body { min-height: 600px; }
      body:focus { outline: none !important; }
      a.keyword-highlight {
        position: relative !important;
        cursor: text !important;
      }
      a.keyword-highlight .kw-x {
        display: none;
        position: absolute;
        top: -10px;
        right: -10px;
        width: 22px;
        height: 22px;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        font-size: 14px;
        line-height: 22px;
        text-align: center;
        cursor: pointer;
        z-index: 100;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        user-select: none;
      }
      a.keyword-highlight:hover .kw-x {
        display: block;
      }
      a.keyword-highlight:hover {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
        border-radius: 4px;
      }
    `;
    doc.head.appendChild(s);

    // Inject remove buttons
    injectRemoveButtons();

    // Track changes
    doc.body.addEventListener("input", () => {
      setHasChanges(true);
      setSaveStatus(null);
      // Re-scan after edits (user might delete a keyword link by editing)
      setTimeout(() => scanKeywords(), 100);
    });

    // Handle clicks: remove buttons & prevent link navigation
    doc.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      // Remove button clicked
      if (target.classList.contains("kw-x")) {
        e.preventDefault();
        e.stopPropagation();
        const link = target.closest("a.keyword-highlight");
        if (link && link.parentNode) {
          let text = "";
          link.childNodes.forEach((n) => {
            if (n.nodeType === Node.TEXT_NODE) text += n.textContent;
            else if (
              n.nodeType === Node.ELEMENT_NODE &&
              !(n as HTMLElement).classList.contains("kw-x")
            )
              text += n.textContent;
          });
          const textNode = doc.createTextNode(text.trim());
          link.parentNode.replaceChild(textNode, link);
          setHasChanges(true);
          setSaveStatus(null);
          scanKeywords();
        }
        return;
      }

      // Prevent link navigation
      const anchor = target.closest("a");
      if (anchor) e.preventDefault();
    });

    // Selection toolbar
    doc.addEventListener("mouseup", () => {
      setTimeout(() => {
        const sel = doc.getSelection();
        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const iframeRect = iframeRef.current!.getBoundingClientRect();
          setToolbarPos({
            top:
              iframeRect.top +
              rect.top -
              52 -
              (iframeRef.current!.contentWindow?.scrollY || 0) +
              window.scrollY,
            left: Math.max(
              iframeRect.left + 10,
              Math.min(
                iframeRect.left + rect.left + rect.width / 2 - 110,
                iframeRect.right - 280
              )
            ),
          });
          setShowToolbar(true);
        } else {
          setShowToolbar(false);
          setShowUrlInput(false);
        }
      }, 10);
    });

    setIframeReady(true);
    scanKeywords();
  }, [getDoc, injectRemoveButtons, scanKeywords]);

  // Add keyword link
  const handleAddLink = useCallback(() => {
    setShowUrlInput(true);
    setUrlValue("https://www.dentalkart.com/");
    setTimeout(() => urlInputRef.current?.focus(), 50);
  }, []);

  const handleConfirmLink = useCallback(() => {
    const doc = getDoc();
    if (!doc) return;
    const sel = doc.getSelection();
    if (!sel || sel.isCollapsed || !urlValue.trim()) return;

    const range = sel.getRangeAt(0);
    const link = doc.createElement("a");
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

    // Inject remove button on new link
    const btn = doc.createElement("span");
    btn.className = "kw-x";
    btn.textContent = "\u00d7";
    btn.setAttribute("contenteditable", "false");
    link.appendChild(btn);

    sel.removeAllRanges();
    setShowToolbar(false);
    setShowUrlInput(false);
    setHasChanges(true);
    setSaveStatus(null);
    scanKeywords();
  }, [urlValue, getDoc, scanKeywords]);

  // Save
  const handleSave = useCallback(async () => {
    const bodyHtml = getCleanBodyHtml();
    if (!bodyHtml) return;
    setSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch(`/api/blog/${blogId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlContent: bodyHtml }),
      });
      const data = await res.json();
      if (data.success) {
        setHasChanges(false);
        setSaveStatus(`Saved (${data.wordCount} words)`);
        onSave(bodyHtml);
      } else {
        setSaveStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setSaveStatus(
        `Error: ${err instanceof Error ? err.message : "Network error"}`
      );
    } finally {
      setSaving(false);
    }
  }, [blogId, getCleanBodyHtml, onSave]);

  // Auto-resize iframe
  useEffect(() => {
    if (!iframeReady) return;
    const doc = getDoc();
    if (!doc?.body) return;
    const resize = () => {
      if (iframeRef.current && doc.body) {
        iframeRef.current.style.height = `${Math.max(doc.body.scrollHeight + 40, 600)}px`;
      }
    };
    resize();
    const obs = new MutationObserver(resize);
    obs.observe(doc.body, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, [iframeReady, getDoc]);

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-40 bg-white border-b rounded-t-lg">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <h3 className="font-semibold text-sm">Editing</h3>
            {hasChanges && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saveStatus && (
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${
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
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                !hasChanges || saving
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Keyword panel */}
        {keywords.length > 0 && (
          <div className="px-3 pb-3">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-700">
                  Keyword Links ({keywords.length})
                </h4>
                <span className="text-xs text-slate-400">
                  Click to locate | x to remove
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw) => (
                  <span
                    key={`${kw.text}-${kw.index}`}
                    className="inline-flex items-center bg-white border border-slate-200 rounded-md px-2 py-1 text-xs shadow-sm hover:border-blue-300 transition-colors"
                  >
                    <button
                      onClick={() => scrollToKeyword(kw.index)}
                      className="text-blue-600 font-medium hover:text-blue-800 mr-1.5 max-w-[200px] truncate"
                      title={kw.url}
                    >
                      {kw.text}
                    </button>
                    <button
                      onClick={() => removeKeyword(kw.index)}
                      className="text-slate-300 hover:text-red-500 transition-colors font-bold text-sm leading-none"
                      title="Remove"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="px-3 py-2 border-t bg-gray-50 text-xs text-gray-400 flex gap-4">
          <span>Click text to edit</span>
          <span>Select text + toolbar to add keyword</span>
          <span>Hover keyword for remove button</span>
        </div>
      </div>

      {/* Floating toolbar */}
      {showToolbar && (
        <div
          className="fixed z-[9999] bg-gray-900 text-white rounded-lg shadow-2xl px-3 py-2 flex items-center gap-2"
          style={{ top: toolbarPos.top, left: toolbarPos.left }}
        >
          {showUrlInput ? (
            <div className="flex items-center gap-2">
              <input
                ref={urlInputRef}
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
                placeholder="https://www.dentalkart.com/c/..."
                className="bg-gray-800 text-white text-xs px-2.5 py-1.5 rounded w-72 border border-gray-600 focus:outline-none focus:border-blue-400"
              />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleConfirmLink();
                }}
                className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-600 font-semibold whitespace-nowrap"
              >
                Link
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setShowUrlInput(false);
                  setShowToolbar(false);
                }}
                className="text-gray-400 hover:text-white text-xs"
              >
                Esc
              </button>
            </div>
          ) : (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                handleAddLink();
              }}
              className="text-xs px-2 py-1 hover:bg-gray-700 rounded font-medium"
            >
              + Add Keyword Link
            </button>
          )}
        </div>
      )}

      {/* Editable iframe */}
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent}
        onLoad={handleIframeLoad}
        className="w-full border-0"
        style={{ minHeight: "600px" }}
        title="Blog editor"
      />
    </div>
  );
}
