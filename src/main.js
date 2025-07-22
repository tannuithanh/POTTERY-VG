import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' 
import './assets/styles/main.css'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/es/style'



const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) 

app.use(pinia)
app.use(router)
app.use(Antd)
app.mount('#app')
