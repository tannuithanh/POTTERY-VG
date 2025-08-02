import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: '6rurjmiwxlbhovjkwxfj',
    wsHost: 'apinotification.vinhgiapottery.com',
    wsPort: 80,
    wssPort: 443,
    disableStats: true,
    enabledTransports: ['ws'], // hoặc ['ws', 'wss']
});

