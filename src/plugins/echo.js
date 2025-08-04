import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

window.Echo = new Echo({
  broadcaster: 'pusher',
  key: '6rurjmiwxlbhovjkwxfj',
  cluster: 'mt1', // ✅ BẮT BUỘC có
  wsHost: 'apinotification.vinhgiapottery.com',
  wsPort: 80,
  forceTLS: false,
  wsPath: '/ws', // phải đúng với nginx proxy tới soketi
  disableStats: true,
  enabledTransports: ['ws'],
})
