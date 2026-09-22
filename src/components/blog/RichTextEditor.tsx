'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon, Code, Undo2, Redo2,
  ImagePlus, Eraser, Type, Loader2, Strikethrough,
} from 'lucide-react'
import { uploadAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const TOOLBAR_GROUPS = [
  [
    { action: 'bold', icon: Bold, title: 'Bold (Ctrl+B)' },
    { action: 'italic', icon: Italic, title: 'Italic (Ctrl+I)' },
    { action: 'underline', icon: Underline, title: 'Underline (Ctrl+U)' },
    { action: 'strike', icon: Strikethrough, title: 'Strikethrough' },
  ],
  [
    { action: 'h1', icon: Heading1, title: 'Heading 1' },
    { action: 'h2', icon: Heading2, title: 'Heading 2' },
    { action: 'h3', icon: Heading3, title: 'Heading 3' },
  ],
  [
    { action: 'ul', icon: List, title: 'Bulleted list' },
    { action: 'ol', icon: ListOrdered, title: 'Numbered list' },
    { action: 'blockquote', icon: Quote, title: 'Blockquote' },
    { action: 'code', icon: Code, title: 'Code block' },
  ],
  [
    { action: 'link', icon: LinkIcon, title: 'Insert link' },
    { action: 'image', icon: ImagePlus, title: 'Insert image' },
    { action: 'clear', icon: Eraser, title: 'Clear formatting' },
  ],
]

function exec(command: string, value?: string) {
  document.execCommand(command, false, value)
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing your post...',
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const skip = useRef(false)
  const [uploading, setUploading] = useState(false)
  const [linkDialog, setLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const savedSelection = useRef<Range | null>(null)
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (ref.current && !skip.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ''
    }
    skip.current = false
  }, [value])

  const checkActiveStates = useCallback(() => {
    const states: Record<string, boolean> = {}
    states.bold = document.queryCommandState('bold')
    states.italic = document.queryCommandState('italic')
    states.underline = document.queryCommandState('underline')
    states.strike = document.queryCommandState('strikeThrough')
    states.ul = document.queryCommandState('insertUnorderedList')
    states.ol = document.queryCommandState('insertOrderedList')
    setActiveStates(states)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = () => checkActiveStates()
    el.addEventListener('keyup', handler)
    el.addEventListener('mouseup', handler)
    document.addEventListener('selectionchange', handler)
    return () => {
      el.removeEventListener('keyup', handler)
      el.removeEventListener('mouseup', handler)
      document.removeEventListener('selectionchange', handler)
    }
  }, [checkActiveStates])

  const pushHistory = (html: string) => {
    setHistory((prev) => {
      const next = [...prev.slice(0, historyIndex + 1), html].slice(-50)
      setHistoryIndex(next.length - 1)
      return next
    })
  }

  const handleInput = () => {
    if (ref.current) {
      onChange(ref.current.innerHTML)
    }
  }

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0)
    }
  }

  const restoreSelection = () => {
    if (savedSelection.current) {
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(savedSelection.current)
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'cover')
      const res = await uploadAPI.upload(fd)
      const url = res.data?.data?.url || res.data?.url
      if (url) {
        restoreSelection()
        if (ref.current) ref.current.focus()
        exec('insertImage', url)
        pushHistory(ref.current?.innerHTML || '')
        handleInput()
        toast.success('Image inserted')
      } else {
        toast.error('Upload failed')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const run = (action: string) => {
    if (!ref.current) return

    if (action === 'image') {
      saveSelection()
      fileRef.current?.click()
      return
    }

    if (action === 'link') {
      saveSelection()
      const sel = window.getSelection()
      const selectedText = sel?.toString() || ''
      setLinkText(selectedText)
      setLinkUrl('')
      setLinkDialog(true)
      return
    }

    ref.current.focus()

    switch (action) {
      case 'bold':
        exec('bold')
        break
      case 'italic':
        exec('italic')
        break
      case 'underline':
        exec('underline')
        break
      case 'strike':
        exec('strikeThrough')
        break
      case 'h1':
        exec('formatBlock', '<h1>')
        break
      case 'h2':
        exec('formatBlock', '<h2>')
        break
      case 'h3':
        exec('formatBlock', '<h3>')
        break
      case 'ul':
        exec('insertUnorderedList')
        break
      case 'ol':
        exec('insertOrderedList')
        break
      case 'blockquote':
        exec('formatBlock', '<blockquote>')
        break
      case 'code': {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
          const range = sel.getRangeAt(0)
          const selected = range.extractContents()
          const pre = document.createElement('pre')
          const code = document.createElement('code')
          code.appendChild(selected)
          pre.appendChild(code)
          range.insertNode(pre)
        } else {
          exec('formatBlock', '<pre>')
        }
        break
      }
      case 'clear':
        exec('removeFormat')
        break
      default:
        break
    }

    pushHistory(ref.current.innerHTML)
    handleInput()
    checkActiveStates()
  }

  const applyLink = () => {
    if (!linkUrl.trim()) { toast.error('URL is required'); return }
    restoreSelection()
    if (ref.current) ref.current.focus()

    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0)
      const selected = range.extractContents()
      const a = document.createElement('a')
      a.href = linkUrl
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.appendChild(selected)
      range.insertNode(a)
    } else {
      const a = document.createElement('a')
      a.href = linkUrl
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.textContent = linkText || linkUrl
      const sel2 = window.getSelection()
      if (sel2 && sel2.rangeCount > 0) {
        sel2.getRangeAt(0).insertNode(a)
      }
    }

    pushHistory(ref.current?.innerHTML || '')
    handleInput()
    setLinkDialog(false)
    setLinkUrl('')
    setLinkText('')
  }

  const undo = () => {
    if (historyIndex <= 0) return
    const idx = historyIndex - 1
    setHistoryIndex(idx)
    skip.current = true
    const html = history[idx] ?? ''
    if (ref.current) ref.current.innerHTML = html
    onChange(html)
  }

  const redo = () => {
    if (historyIndex >= history.length - 1) return
    const idx = historyIndex + 1
    setHistoryIndex(idx)
    skip.current = true
    const html = history[idx] ?? ''
    if (ref.current) ref.current.innerHTML = html
    onChange(html)
  }

  return (
    <div className="rounded-xl overflow-hidden bg-white border border-slate-200">
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
        {TOOLBAR_GROUPS.map((group, gi) => (
          <span key={gi} className="contents">
            {gi > 0 && <span className="mx-1 h-4 w-px bg-slate-200" />}
            {group.map((t) => {
              const Icon = t.icon
              const isActive = activeStates[t.action]
              return (
                <button
                  key={t.action}
                  type="button"
                  title={t.title}
                  disabled={t.action === 'image' && uploading}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    run(t.action)
                  }}
                  className={`p-1.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-[#6D3DF5]/15 text-[#6D3DF5]'
                      : 'text-slate-600 hover:bg-[#6D3DF5]/10 hover:text-[#6D3DF5]'
                  } ${t.action === 'image' && uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t.action === 'image' && uploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </button>
              )
            })}
          </span>
        ))}
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <button
          type="button"
          title="Undo (Ctrl+Z)"
          disabled={historyIndex <= 0}
          onMouseDown={(e) => { e.preventDefault(); undo() }}
          className="p-1.5 rounded-md text-slate-600 hover:bg-[#6D3DF5]/10 hover:text-[#6D3DF5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Redo (Ctrl+Y)"
          disabled={historyIndex >= history.length - 1}
          onMouseDown={(e) => { e.preventDefault(); redo() }}
          className="p-1.5 rounded-md text-slate-600 hover:bg-[#6D3DF5]/10 hover:text-[#6D3DF5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
          <Type className="w-3 h-3" /> Rich text
        </span>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        onKeyDown={(e) => {
          if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
            e.preventDefault()
            redo()
          } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            undo()
          }
        }}
        data-placeholder={placeholder}
        className="min-h-[320px] p-4 outline-none text-[14px] leading-[1.8] text-slate-800 prose-content empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      />

      {/* Link dialog */}
      <Dialog open={linkDialog} onOpenChange={(o) => !o && setLinkDialog(false)}>
        <DialogContent className="bg-white border border-[#E9E7F5] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#0F1B3D] text-sm">Insert Link</DialogTitle>
            <DialogDescription className="text-[#536078] text-xs">
              Add a hyperlink to your content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">URL *</label>
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full h-9 px-3 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && applyLink()}
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#536078] mb-1.5 font-medium">Display text (optional)</label>
              <input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text"
                className="w-full h-9 px-3 rounded-xl bg-white border border-[#E9E7F5] text-xs text-[#0F1B3D] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6D3DF5]/40 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && applyLink()}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setLinkDialog(false)} className="h-8 px-4 rounded-xl text-xs text-[#536078] border border-[#E9E7F5] hover:bg-[#F8F7FC] transition-colors">
              Cancel
            </button>
            <button onClick={applyLink} className="h-8 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white">
              Insert Link
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
