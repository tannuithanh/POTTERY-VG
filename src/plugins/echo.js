import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

window.Echo = new Echo({
  broadcaster: 'pusher',
  key: 'cfdfec910624f2fa8c4e',
  cluster: 'ap1',
  forceTLS: true,
  enabledTransports: ['ws', 'wss'],
})
