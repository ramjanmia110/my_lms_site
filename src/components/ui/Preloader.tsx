'use client'

import { useEffect, useState } from 'react'

const PRELOADER_CSS = `
  #l2e-preloader {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 24px;
    opacity: 0;
    animation: l2e-fade-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  /* Leaving state. The entrance animation must be cancelled, otherwise its
     fill-mode keeps overriding opacity and the element never fades out. */
  #l2e-preloader.is-leaving {
    animation: none;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
  }
  @keyframes l2e-fade-in {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes l2e-rise {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  #l2e-preloader .l2e-ring {
    position: relative;
    width: 150px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #l2e-preloader .l2e-ring-track,
  #l2e-preloader .l2e-ring-arc {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
  }
  #l2e-preloader .l2e-ring-track {
    border: 4px solid #E8E8E8;
  }
  #l2e-preloader .l2e-ring-arc {
    border: 4px solid transparent;
    border-top-color: #1B4D3E;
    animation: l2e-spin 1s linear infinite;
  }
  #l2e-preloader .l2e-icon {
    width: 200px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #l2e-preloader .l2e-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 14px;
  }
  #l2e-preloader .l2e-name {
    font-weight: 700;
    font-size: 28px;
    color: #1B4D3E;
    line-height: 1.1;
    text-align: center;
    animation: l2e-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
  }
  #l2e-preloader .l2e-tagline {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #4B5563;
    text-align: center;
    margin-top: -10px;
    animation: l2e-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.32s both;
  }
  #l2e-preloader .l2e-dot {
    color: #DD8845;
  }
  @keyframes l2e-spin {
    to { transform: rotate(360deg); }
  }
  @media (max-width: 640px) {
    #l2e-preloader .l2e-ring {
      width: 110px;
      height: 110px;
    }
    #l2e-preloader .l2e-icon {
      width: 150px;
      height: 48px;
    }
    #l2e-preloader .l2e-icon img {
      width: 150px;
      height: 48px;
    }
    #l2e-preloader .l2e-name {
      font-size: 22px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    #l2e-preloader .l2e-ring-arc {
      animation: none;
    }
  }
`

type Phase = 'entering' | 'leaving' | 'gone'

export default function Preloader() {
  const [phase, setPhase] = useState<Phase>('entering')

  useEffect(() => {
    let cancelled = false
    let scrollLocked = false
    const timers: ReturnType<typeof setTimeout>[] = []

    const later = (fn: () => void, ms: number) => {
      timers.push(
        setTimeout(() => {
          if (!cancelled) fn()
        }, ms),
      )
    }

    const unlockScroll = () => {
      if (scrollLocked) {
        document.body.style.overflow = ''
        scrollLocked = false
      }
    }

    // Unmounting is React's job. Never detach this node by hand: React still
    // owns it, and removing it imperatively makes the later commit-phase
    // deletion throw "Failed to execute 'removeChild' on 'Node'".
    const dismiss = () => {
      if (cancelled) return
      setPhase('leaving')
      later(() => {
        unlockScroll()
        setPhase('gone')
      }, 400)
    }

    let alreadyShown = false
    try {
      alreadyShown = sessionStorage.getItem('l2e-shown') === '1'
    } catch {
      // Storage blocked (private mode / strict cookie policy): treat as a
      // first visit rather than crashing.
    }

    // Show only once per session
    if (alreadyShown) {
      later(dismiss, 0)
      return () => {
        cancelled = true
        timers.forEach(clearTimeout)
      }
    }

    try {
      sessionStorage.setItem('l2e-shown', '1')
    } catch {
      /* ignore */
    }

    const started = Date.now()

    document.body.style.overflow = 'hidden'
    scrollLocked = true

    const reveal = () => {
      later(dismiss, Math.max(0, 1000 - (Date.now() - started)))
    }

    // Hide on window load (with 1s minimum)
    if (document.readyState === 'complete') {
      reveal()
    } else {
      window.addEventListener('load', reveal, { once: true })
    }

    // Fallback in case load already fired or is delayed
    later(reveal, 5000)

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      window.removeEventListener('load', reveal)
      unlockScroll()
    }
  }, [])

  if (phase === 'gone') return null

  return (
    <>
      <style>{PRELOADER_CSS}</style>
      <div
        id="l2e-preloader"
        aria-hidden="true"
        className={phase === 'leaving' ? 'is-leaving' : undefined}
      >
        <div className="l2e-ring">
          <div className="l2e-ring-track" />
          <div className="l2e-ring-arc" />
          <div className="l2e-icon">
            <img
              src="https://plain-apac-prod-public.komododecks.com/202609/24/QvqonU8iVHyTE9fh3hih/image.png"
              alt="Learn2Earn"
            />
          </div>
        </div>
        <div className="l2e-name">Learn2Earn</div>
        <div className="l2e-tagline">
          Learn Today <span className="l2e-dot">•</span> Earn Tomorrow
        </div>
      </div>
    </>
  )
}
