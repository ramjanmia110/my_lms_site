import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

let echoInstance: Echo<any> | null = null

export function getEcho(token: string): Echo<any> {
  if (echoInstance) return echoInstance

  Pusher.logToConsole = true

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: 'learnforge-key',
    wsHost: window.location.hostname,
    wsPort: 8080,
    wssPort: 8080,
    forceTLS: false,
    encrypted: false,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')}/broadcasting/auth`,
    auth: {
      headers: { Authorization: `Bearer ${token}` },
    },
  })

  return echoInstance
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
}
