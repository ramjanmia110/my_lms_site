'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Code2, Eye, SplitSquareHorizontal, RotateCcw, Trash2,
  FileCode2, FileCog, FileTerminal, Monitor, Tablet, Smartphone,
  AlertTriangle, Info, X, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type FileKey = 'html' | 'css' | 'js'
type Device = 'desktop' | 'tablet' | 'mobile'
type ViewMode = 'editor' | 'preview' | 'split'

interface ConsoleEntry {
  id: number
  type: 'log' | 'warn' | 'error' | 'info'
  text: string
}

const CAPTURE_SCRIPT = `(function(){
  var L2E = window.__L2E__ = { logs: [] };
  ['log','warn','error','info'].forEach(function(level){
    var orig = console[level];
    console[level] = function(){
      var args = Array.prototype.slice.call(arguments);
      var text = args.map(function(a){
        try {
          if (typeof a === 'string') return a;
          if (a instanceof Error) return a.name + ': ' + a.message;
          return JSON.stringify(a);
        } catch(e) { return String(a); }
      }).join(' ');
      L2E.logs.push({ type: level, text: text });
      try { window.parent.postMessage({ type: 'l2e:console', entry: { type: level, text: text } }, '*'); } catch(e){}
      orig.apply(console, arguments);
    };
  });
  window.addEventListener('error', function(e){
    var msg = e.message || 'Unknown error';
    if (e.lineno != null) msg += ' (line ' + e.lineno + ')';
    try { window.parent.postMessage({ type: 'l2e:error', entry: { text: msg } }, '*'); } catch(err){}
  });
  window.addEventListener('unhandledrejection', function(e){
    var r = e.reason;
    var msg = 'Unhandled promise rejection: ' + (r && r.message ? r.message : (r || ''));
    try { window.parent.postMessage({ type: 'l2e:error', entry: { text: msg } }, '*'); } catch(err){}
  });
})();`

const files: { key: FileKey; label: string; icon: any; lang: string }[] = [
  { key: 'html', label: 'index.html', icon: FileCode2, lang: 'HTML' },
  { key: 'css', label: 'styles.css', icon: FileCog, lang: 'CSS' },
  { key: 'js', label: 'script.js', icon: FileTerminal, lang: 'JavaScript' },
]

const deviceWidths: Record<Device, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
}

const deviceIcons: Record<Device, any> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
}

function LineNumberedEditor({
  value,
  onChange,
  language,
  onSave,
}: {
  value: string
  onChange: (v: string) => void
  language: string
  onSave?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const lineCount = useMemo(() => value.split('\n').length, [value])
  const lineNumbers = useMemo(() => Array.from({ length: lineCount }, (_, i) => i + 1).join('\n'), [lineCount])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      onSave?.()
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.currentTarget
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = value.substring(0, start) + '  ' + value.substring(end)
      onChange(next)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2
      })
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const gutter = ref.current?.previousElementSibling as HTMLElement | null
    if (gutter) gutter.scrollTop = e.currentTarget.scrollTop
  }

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-[#0B1622]">
      <div
        ref={ref}
        aria-hidden
        className="select-none overflow-hidden text-right px-3 py-3 font-mono text-[11px] leading-[1.55] text-slate-600 bg-[#0B1622] border-r border-white/[0.04] whitespace-pre"
      >
        {lineNumbers}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        spellCheck={false}
        placeholder={`Write your ${language} code here...`}
        className="flex-1 h-full min-w-0 resize-none bg-transparent text-[#E6EDF3] font-mono text-[11px] leading-[1.55] outline-none p-3 placeholder:text-slate-600"
      />
    </div>
  )
}

export function ToolCodeEditor({
  html,
  css,
  js,
  onChange,
  onSave,
}: {
  html: string
  css: string
  js: string
  onChange: (html: string, css: string, js: string) => void
  onSave?: () => void
}) {
  const [activeFile, setActiveFile] = useState<FileKey>('html')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [device, setDevice] = useState<Device>('desktop')
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([])
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [rendered, setRendered] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const entryId = useRef(0)
  const consoleRef = useRef<HTMLDivElement>(null)

  const pushConsole = useCallback((entry: Omit<ConsoleEntry, 'id'>) => {
    entryId.current += 1
    setConsoleEntries((prev) => [...prev.slice(-199), { ...entry, id: entryId.current }])
  }, [])

  const [debounced, setDebounced] = useState({ html, css, js })

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced({ html, css, js })
      setRendered(true)
    }, 500)
    return () => clearTimeout(t)
  }, [html, css, js])

  const combinedDoc = useMemo(() => {
    const cssCode = debounced.css || ''
    const jsCode = debounced.js || ''
    const htmlCode = debounced.html || ''
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
html,body{margin:0;padding:0;min-height:100%;background:#fff;color:#111;font-family:system-ui,-apple-system,sans-serif}
*{box-sizing:border-box}
${cssCode}
</style>
</head>
<body>
${htmlCode}
<script>
${CAPTURE_SCRIPT}
<\/script>
<script>
try {
${jsCode}
} catch (e) {
  window.parent.postMessage({ type: 'l2e:error', entry: { text: (e && e.name ? e.name + ': ' : 'Error: ') + (e && e.message ? e.message : e) } }, '*');
}
<\/script>
</body>
</html>`
  }, [debounced])

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data !== 'object') return
      if (data.type === 'l2e:console') pushConsole(data.entry)
      if (data.type === 'l2e:error') pushConsole({ type: 'error', text: data.entry?.text || 'Unknown error' })
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [pushConsole])

  useEffect(() => {
    if (consoleOpen && consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [consoleEntries, consoleOpen])

  const handleReload = () => {
    setRendered(false)
    setTimeout(() => {
      setIframeKey((k) => k + 1)
      setConsoleEntries([])
      setRendered(true)
    }, 50)
  }

  const handleClearConsole = () => setConsoleEntries([])

  const setFile = (key: FileKey) => {
    if (viewMode === 'preview') setViewMode('split')
    setActiveFile(key)
  }

  const activeValue = { html, css, js }[activeFile]
  const activeLang = files.find((f) => f.key === activeFile)!.lang
  const showEditor = viewMode === 'editor' || viewMode === 'split'
  const showPreview = viewMode === 'preview' || viewMode === 'split'

  return (
    <div className="rounded-xl overflow-hidden bg-[#0D1B2A] border border-white/[0.07] flex flex-col">
      {/* Title bar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[#0F2133] border-b border-white/[0.06]">
        <div className="flex gap-1.5 mr-2">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <span className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        {/* File tabs */}
        <div className="flex items-center gap-0.5 flex-wrap">
          {files.map((f) => {
            const Icon = f.icon
            return (
              <button
                key={f.key}
                onClick={() => setFile(f.key)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors',
                  activeFile === f.key && showEditor
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                )}
              >
                <Icon className="w-3 h-3 text-slate-500" />
                {f.label}
              </button>
            )
          })}
        </div>
        <div className="ml-auto flex items-center gap-1">
          {/* Device switcher */}
          <div className="hidden sm:flex items-center gap-0.5 bg-white/[0.04] rounded-lg p-0.5 mr-1">
            {(Object.keys(deviceWidths) as Device[]).map((d) => {
              const Icon = deviceIcons[d]
              return (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  title={d}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    device === d ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  <Icon className="w-3 h-3" />
                </button>
              )
            })}
          </div>
          {/* View mode */}
          <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('editor')}
              title="Editor only"
              className={cn('p-1.5 rounded-md transition-colors', viewMode === 'editor' ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300')}
            >
              <Code2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              title="Split view"
              className={cn('p-1.5 rounded-md transition-colors', viewMode === 'split' ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300')}
            >
              <SplitSquareHorizontal className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              title="Preview only"
              className={cn('p-1.5 rounded-md transition-colors', viewMode === 'preview' ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300')}
            >
              <Eye className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={handleReload}
            title="Reload preview"
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            onClick={() => setConsoleOpen((o) => !o)}
            title="Console"
            className={cn(
              'flex items-center gap-1 p-1.5 rounded-lg transition-colors',
              consoleOpen || consoleEntries.some((e) => e.type === 'error')
                ? 'text-[#FF8A36] hover:bg-[#FF8A36]/10'
                : 'text-slate-500 hover:text-white hover:bg-white/[0.06]'
            )}
          >
            <AlertTriangle className="w-3 h-3" />
            {consoleEntries.length > 0 && (
              <span className="text-[9px] font-bold">{consoleEntries.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={cn('grid gap-px bg-white/[0.04] h-[520px]', showEditor && showPreview ? 'grid-cols-2' : 'grid-cols-1')}>
        {showEditor && (
          <div className="min-w-0 min-h-0 bg-[#0B1622]">
            <LineNumberedEditor
              value={activeValue}
              onChange={(v) => {
                if (activeFile === 'html') onChange(v, css, js)
                if (activeFile === 'css') onChange(html, v, js)
                if (activeFile === 'js') onChange(html, css, v)
              }}
              language={activeLang}
              onSave={onSave}
            />
          </div>
        )}
        {showPreview && (
          <div className="min-w-0 min-h-0 bg-white flex flex-col">
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-black/5 bg-[#F5F6F8]">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{device}</span>
              <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
                <Info className="w-3 h-3" />
                Sandboxed
              </div>
            </div>
            <div className="flex-1 flex items-start justify-center overflow-auto bg-[#E9EBF0] p-3">
              <div style={{ width: deviceWidths[device], height: '100%' }} className="bg-white shadow-sm rounded-sm overflow-hidden">
                {!rendered ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <iframe
                    key={iframeKey}
                    title="Tool preview"
                    srcDoc={combinedDoc}
                    sandbox="allow-scripts allow-forms allow-modals allow-popups allow-downloads"
                    className="w-full h-full border-0 bg-white"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Console */}
      {consoleOpen && (
        <div className="border-t border-white/[0.06] bg-[#0A1420]">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Console</span>
            <div className="flex items-center gap-1">
              <button onClick={handleClearConsole} className="flex items-center gap-1 p-1 rounded text-[10px] text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors">
                <Trash2 className="w-3 h-3" /> Clear
              </button>
              <button onClick={() => setConsoleOpen(false)} className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div ref={consoleRef} className="max-h-40 overflow-y-auto px-3 pb-2 font-mono text-[10px] space-y-1">
            {consoleEntries.length === 0 ? (
              <p className="text-slate-600 py-1">No console output. Errors and logs from the tool will appear here.</p>
            ) : (
              consoleEntries.map((e) => (
                <div
                  key={e.id}
                  className={cn(
                    'flex items-start gap-1.5 py-0.5 px-1 rounded',
                    e.type === 'error' && 'bg-red-500/10 text-red-300',
                    e.type === 'warn' && 'bg-amber-500/10 text-amber-300',
                    e.type === 'log' && 'text-slate-300',
                    e.type === 'info' && 'text-sky-300'
                  )}
                >
                  <span className="shrink-0 uppercase text-[9px] font-bold opacity-60">{e.type}</span>
                  <span className="whitespace-pre-wrap break-all">{e.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
