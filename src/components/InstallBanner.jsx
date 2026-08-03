import { useEffect, useState } from 'react'
import { getDeferredPrompt, onInstallPromptAvailable, promptInstall } from '../lib/installPrompt'

const DISMISSED_KEY = 'hc_install_banner_dismissed'

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  )
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
}

function ShareIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <rect x="5" y="10" width="14" height="11" rx="2" />
    </svg>
  )
}

function MoreMenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  )
}

function Step({ number, icon, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-parchment">
        {number}
      </span>
      <span className="flex flex-1 items-center gap-2 text-sm text-ink/80">
        {children}
        {icon}
      </span>
    </li>
  )
}

// PRD 6.1: a dismissible "Add to Home Screen" prompt on first login. Chrome/
// Edge/Android support a real install prompt (beforeinstallprompt) — kept as
// the one-tap primary path there, since it's already simpler than any
// written instructions could be. iOS Safari never fires that event, and some
// Android browsers don't either, so both get explicit numbered steps
// (auto-picked by platform, per organizer feedback that "Share icon, More,
// Add to Home Screen" was too abstract for less tech-savvy members).
export default function InstallBanner() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1')
  const [canPrompt, setCanPrompt] = useState(() => Boolean(getDeferredPrompt()))
  const [showSteps, setShowSteps] = useState(false)

  useEffect(() => onInstallPromptAvailable(() => setCanPrompt(true)), [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  if (dismissed || isStandalone()) return null

  const ios = isIOS()

  async function handleInstall() {
    const choice = await promptInstall()
    if (choice) dismiss()
  }

  return (
    <div className="px-4">
      <div className="rounded-lg border border-border bg-surface px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-medium">Add History Camp to your Home Screen</p>
            <p className="mt-1 text-sm text-ink/70">
              Quick access all day, even with spotty WiFi.
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={dismiss}
            className="shrink-0 rounded-md px-2 py-1 text-sm text-ink/60"
          >
            Dismiss
          </button>
        </div>

        {!ios && canPrompt && (
          <button
            type="button"
            onClick={handleInstall}
            className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-parchment"
          >
            Add to Home Screen
          </button>
        )}

        {(ios || !canPrompt) && (
          <>
            <button
              type="button"
              onClick={() => setShowSteps((prev) => !prev)}
              className="mt-3 text-sm font-medium text-primary underline"
            >
              {showSteps ? 'Hide steps' : 'Show me how'}
            </button>

            {showSteps && (
              <ol className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
                {ios ? (
                  <>
                    <Step number={1} icon={<ShareIcon className="h-5 w-5 text-ink/60" />}>
                      Tap the <strong>Share</strong> icon in Safari's toolbar
                    </Step>
                    <Step number={2}>
                      Scroll down and tap <strong>"Add to Home Screen"</strong>
                    </Step>
                    <Step number={3}>
                      Tap <strong>"Add"</strong> in the top-right corner
                    </Step>
                  </>
                ) : (
                  <>
                    <Step number={1} icon={<MoreMenuIcon className="h-5 w-5 text-ink/60" />}>
                      Tap the menu icon in your browser's toolbar
                    </Step>
                    <Step number={2}>
                      Tap <strong>"Add to Home screen"</strong> (or <strong>"Install app"</strong>)
                    </Step>
                    <Step number={3}>
                      Tap <strong>"Add"</strong> or <strong>"Install"</strong> to confirm
                    </Step>
                  </>
                )}
              </ol>
            )}
          </>
        )}
      </div>
    </div>
  )
}
