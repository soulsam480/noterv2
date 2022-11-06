import { createHead } from '@vueuse/head'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import '@/assets/index.scss'
import 'anu-vue/dist/style.css'
import 'uno.css'

const app = createApp(App)
const head = createHead()

app.use(router)
app.use(head)
app.mount('#app')
