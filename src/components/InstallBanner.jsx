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

// PRD 6.1: a dismissible "Add to Home Screen" prompt on first login. Chrome/
// Edge/Android support a real install prompt (beforeinstallprompt); iOS
// Safari never fires that event, so it gets manual instructions instead.
export default function InstallBanner() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1')
  const [canPrompt, setCanPrompt] = useState(() => Boolean(getDeferredPrompt()))

  useEffect(() => onInstallPromptAvailable(() => setCanPrompt(true)), [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  if (dismissed || isStandalone()) return null
  if (!isIOS() && !canPrompt) return null

  async function handleInstall() {
    const choice = await promptInstall()
    if (choice) dismiss()
  }

  return (
    <div className="px-4">
      <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
        <div>
          <p className="text-base font-medium">Add History Camp to your Home Screen</p>
          {isIOS() ? (
            <p className="mt-1 text-sm text-ink/70">
              Tap the Share icon, then "Add to Home Screen" — quick access all day, even with
              spotty WiFi.
            </p>
          ) : (
            <p className="mt-1 text-sm text-ink/70">
              Quick access all day, even with spotty WiFi.
            </p>
          )}
          {!isIOS() && (
            <button
              type="button"
              onClick={handleInstall}
              className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-parchment"
            >
              Add to Home Screen
            </button>
          )}
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
    </div>
  )
}
