// Captures the browser's `beforeinstallprompt` event as early as possible
// (imported for its side effect in main.jsx) so it isn't missed if it fires
// before any component that wants to react to it has mounted — Chrome/Edge
// only offer the event once per page load and don't re-fire it later.
let deferredPrompt = null
const listeners = new Set()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    listeners.forEach((cb) => cb())
  })
}

export function getDeferredPrompt() {
  return deferredPrompt
}

export function onInstallPromptAvailable(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export async function promptInstall() {
  if (!deferredPrompt) return null
  deferredPrompt.prompt()
  const choice = await deferredPrompt.userChoice
  deferredPrompt = null
  return choice
}
