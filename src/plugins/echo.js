import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: 'pusher',
  key: '6rurjmiwxlbhovjkwxfj',
  cluster: 'mt1',
  wsHost: '172.23.13.102', // ✅ IP Laravel Reverb
  wsPort: 8080,
  forceTLS: false,
  encrypted: false,
  disableStats: true,
  enabledTransports: ['ws'],
});
