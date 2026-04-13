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

export default function BlogEditor({ blogId, htmlContent, onSave }: BlogEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Store initial HTML so iframe never reloads after save
  const initialHtmlRef = useRef(htmlContent);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<KeywordLink[]>([]);
  const [ready, setReady] = useState(false);

  const getDoc = () => iframeRef.current?.contentDocument ?? null;

  const getLinkText = (el: Element) => (el.textContent || "").trim();

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
    clone.querySelectorAll("#ed-toolbar, .kw-x").forEach((b) => b.remove());
    return clone.innerHTML;
  }, []);

  // ── Build the full editor HTML with toolbar injected INSIDE the iframe ──
  const buildEditorHtml = useCallback(() => {
    // Inject editor CSS + toolbar HTML + script directly into the blog HTML
    const editorCSS = `
      <style id="ed-style">
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

        a.keyword-highlight { cursor: text !important; }
        a.keyword-highlight:hover { outline:2px solid #3b82f6 !important; outline-offset:2px !important; border-radius:4px; }

        #ed-toolbar {
          display: none;
          position: absolute;
          z-index: 99999;
          background: #1f2937;
          color: #fff;
          border-radius: 10px;
          padding: 6px 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,.3);
          font-family: 'Inter',system-ui,sans-serif;
          font-size: 13px;
          white-space: nowrap;
        }
        #ed-toolbar.show { display: flex; align-items: center; gap: 6px; }
        #ed-toolbar button {
          background: none; border: none; color: #fff; cursor: pointer;
          padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
        }
        #ed-toolbar button:hover { background: #374151; }
        #ed-toolbar button.primary { background: #3b82f6; }
        #ed-toolbar button.primary:hover { background: #2563eb; }
        #ed-toolbar button.danger { background: #ef4444; }
        #ed-toolbar button.danger:hover { background: #dc2626; }
        #ed-toolbar input {
          background: #374151; border: 1px solid #4b5563; color: #fff;
          padding: 4px 8px; border-radius: 6px; font-size: 12px; width: 260px;
          outline: none;
        }
        #ed-toolbar input:focus { border-color: #3b82f6; }
        #ed-toolbar .label { color: #9ca3af; font-size: 11px; margin-right: 4px; }
      </style>
    `;

    const toolbarHtml = `<div id="ed-toolbar" contenteditable="false"></div>`;

    const editorScript = `
      <script>
      (function() {
        document.body.contentEditable = 'true';
        document.execCommand('defaultParagraphSeparator', false, 'p');

        var toolbar = document.getElementById('ed-toolbar');
        var savedRange = null;
        var activeKw = null;

        function notify(type, data) {
          window.parent.postMessage({ source: 'blog-editor', type: type, data: data }, '*');
        }

        // input → notify parent
        document.body.addEventListener('input', function() {
          notify('changed');
        });

        // prevent link navigation in edit mode
        document.addEventListener('click', function(e) {
          var a = e.target.closest ? e.target.closest('a') : null;
          if (a) e.preventDefault();
        });

        // mouseup → show toolbar
        document.addEventListener('mouseup', function(e) {
          // ignore clicks on toolbar itself
          if (toolbar.contains(e.target)) return;

          setTimeout(function() {
            var sel = window.getSelection();
            if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
              toolbar.className = '';
              toolbar.innerHTML = '';
              savedRange = null;
              activeKw = null;
              return;
            }
            var range = sel.getRangeAt(0);
            var rect = range.getBoundingClientRect();
            if (rect.width === 0) { toolbar.className = ''; return; }

            savedRange = range.cloneRange();

            // position toolbar above selection
            toolbar.style.top = (rect.top + window.scrollY - 44) + 'px';
            toolbar.style.left = Math.max(10, rect.left + rect.width/2 - 80) + 'px';

            // check if selection touches a keyword link (anchor, focus, or common ancestor)
            function findKeyword(node) {
              if (!node) return null;
              var el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
              return el && el.closest ? el.closest('a.keyword-highlight') : null;
            }
            var kw =
              findKeyword(sel.anchorNode) ||
              findKeyword(sel.focusNode) ||
              findKeyword(range.commonAncestorContainer) ||
              findKeyword(range.startContainer) ||
              findKeyword(range.endContainer);

            if (kw) {
              activeKw = kw;
              toolbar.innerHTML = '<span class="label">Keyword linked</span><button class="danger" id="ed-unlink">Unlink</button>';
            } else {
              activeKw = null;
              toolbar.innerHTML = '<button class="primary" id="ed-link">+ Add Keyword Link</button>';
            }
            toolbar.className = 'show';
          }, 10);
        });

        // toolbar click handlers (delegated)
        toolbar.addEventListener('mousedown', function(e) {
          e.preventDefault(); // prevent focus loss
          e.stopPropagation();
        });

        toolbar.addEventListener('click', function(e) {
          var target = e.target;

          // "Add Keyword Link" → show URL input
          if (target.id === 'ed-link') {
            toolbar.innerHTML = '<input type="url" id="ed-url" value="https://www.dentalkart.com/" placeholder="https://www.dentalkart.com/c/..." /><button class="primary" id="ed-confirm">Link</button><button id="ed-cancel">Esc</button>';
            toolbar.className = 'show';
            var inp = document.getElementById('ed-url');
            if (inp) { inp.focus(); inp.select(); }
            return;
          }

          // "Link" → apply link
          if (target.id === 'ed-confirm') {
            var url = document.getElementById('ed-url').value.trim();
            if (!url || !savedRange) return;
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);

            var link = document.createElement('a');
            link.href = url;
            link.className = 'keyword-highlight';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            try { savedRange.surroundContents(link); }
            catch(ex) {
              var frag = savedRange.extractContents();
              link.appendChild(frag);
              savedRange.insertNode(link);
            }
            sel.removeAllRanges();
            toolbar.className = '';
            toolbar.innerHTML = '';
            savedRange = null;
            notify('changed');
            notify('keywords-changed');
            return;
          }

          // "Unlink" → remove keyword link
          if (target.id === 'ed-unlink') {
            if (activeKw && activeKw.parentNode) {
              var txt = document.createTextNode(activeKw.textContent || '');
              activeKw.parentNode.replaceChild(txt, activeKw);
              activeKw = null;
              toolbar.className = '';
              toolbar.innerHTML = '';
              savedRange = null;
              notify('changed');
              notify('keywords-changed');
            }
            return;
          }

          // "Esc"
          if (target.id === 'ed-cancel') {
            toolbar.className = '';
            toolbar.innerHTML = '';
            return;
          }
        });

        // Enter in URL input → confirm
        toolbar.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' && e.target.id === 'ed-url') {
            document.getElementById('ed-confirm').click();
          }
          if (e.key === 'Escape') {
            toolbar.className = '';
            toolbar.innerHTML = '';
          }
        });

        // mousedown outside toolbar → hide
        document.addEventListener('mousedown', function(e) {
          if (!toolbar.contains(e.target)) {
            toolbar.className = '';
            toolbar.innerHTML = '';
          }
        });

        notify('ready');
        notify('keywords-changed');
      })();
      </script>
    `;

    // Inject CSS into <head>, toolbar+script into <body>
    // Strip any leftover .kw-x buttons from previously saved HTML
    const cleanHtml = initialHtmlRef.current
      .replace(/<span[^>]*class=["']kw-x["'][^>]*>[^<]*<\/span>/gi, "");

    return cleanHtml
      .replace("</head>", editorCSS + "</head>")
      .replace("</body>", toolbarHtml + editorScript + "</body>");
  }, []);

  // ── Listen for messages from iframe ──
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.source !== "blog-editor") return;
      if (e.data.type === "changed") {
        setHasChanges(true);
        setSaveStatus(null);
      }
      if (e.data.type === "keywords-changed") {
        setTimeout(() => scanKeywords(), 50);
      }
      if (e.data.type === "ready") {
        setReady(true);
        scanKeywords();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [scanKeywords]);

  // auto-resize iframe
  useEffect(() => {
    if (!ready) return;
    const iframe = iframeRef.current;
    const d = getDoc();
    if (!iframe || !d?.body) return;
    const resize = () => {
      iframe.style.height = `${Math.max(d.body.scrollHeight + 60, 600)}px`;
    };
    resize();
    const obs = new MutationObserver(resize);
    obs.observe(d.body, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, [ready]);

  // ── actions from parent ──
  const removeKeyword = useCallback((index: number) => {
    const d = getDoc();
    if (!d) return;
    const link = d.querySelectorAll("a.keyword-highlight")[index];
    if (!link?.parentNode) return;
    link.parentNode.replaceChild(d.createTextNode(getLinkText(link)), link);
    setHasChanges(true);
    setSaveStatus(null);
    scanKeywords();
  }, [scanKeywords]);

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

  // ── render ──
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Sticky bar */}
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

      {/* Iframe with toolbar inside it */}
      <iframe
        ref={iframeRef}
        srcDoc={buildEditorHtml()}
        className="w-full border-0 block"
        style={{ minHeight: "600px" }}
        title="Blog editor"
      />
    </div>
  );
}
