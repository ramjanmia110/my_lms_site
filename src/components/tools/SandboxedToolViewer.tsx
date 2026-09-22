'use client'

import { useEffect, useMemo, useState } from 'react'
import { Monitor, Smartphone, Tablet, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

type Device = 'desktop' | 'tablet' | 'mobile'

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

export function SandboxedToolViewer({
  html,
  css,
  js,
  className,
  onRun,
  fullScreen,
}: {
  html: string
  css: string
  js: string
  className?: string
  onRun?: () => void
  fullScreen?: boolean
}) {
  const [device, setDevice] = useState<Device>('desktop')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    onRun?.()
  }, [])

  const combinedDoc = useMemo(() => {
    if (fullScreen) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
html,body{margin:0;padding:0;width:100%;min-height:100vh;overflow:auto;scrollbar-width:none;-ms-overflow-style:none;background:#fff;color:#111;font-family:system-ui,-apple-system,sans-serif}
html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}
*{box-sizing:border-box}
${css || ''}
</style>
</head>
<body>
${html || ''}
<script>
try {
${js || ''}
} catch (e) {
  console.error(e);
}
<\/script>
</body>
</html>`
    }
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
html,body{margin:0;padding:0;width:100%;min-height:100vh;background:#fff;color:#111;font-family:system-ui,-apple-system,sans-serif}
*{box-sizing:border-box}
${css || ''}
</style>
</head>
<body>
${html || ''}
<script>
try {
${js || ''}
} catch (e) {
  console.error(e);
}
<\/script>
</body>
</html>`
  }, [html, css, js, fullScreen])

  if (fullScreen) {
    return (
      <div className="w-full h-full overflow-hidden">
        <iframe
          key={reloadKey}
          title="Tool"
          srcDoc={combinedDoc}
          sandbox="allow-scripts allow-forms allow-modals allow-popups allow-downloads"
          className="w-full h-full border-0"
        />
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl overflow-hidden border border-slate-200 bg-white', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="ml-auto flex items-center gap-1">
          {(Object.keys(deviceWidths) as Device[]).map((d) => {
            const Icon = deviceIcons[d]
            return (
              <button
                key={d}
                onClick={() => setDevice(d)}
                title={d}
                className={cn(
                  'p-1 rounded-md transition-colors',
                  device === d ? 'bg-[#6D3DF5]/10 text-[#6D3DF5]' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <Icon className="w-3 h-3" />
              </button>
            )
          })}
          <button
            onClick={() => { setReloadKey((k) => k + 1); onRun?.() }}
            title="Reload"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RefreshCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
      {/* Tool iframe — full width, full height */}
      <div
        style={{ width: deviceWidths[device], maxWidth: '100%', margin: device !== 'desktop' ? '0 auto' : undefined }}
      >
        <iframe
          key={reloadKey}
          title="Tool"
          srcDoc={combinedDoc}
          sandbox="allow-scripts allow-forms allow-modals allow-popups allow-downloads"
          className="w-full border-0"
          style={{ minHeight: '80vh' }}
        />
      </div>
    </div>
  )
}
