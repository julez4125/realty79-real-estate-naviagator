import './scss/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/styles/essential.css'
import 'vuestic-ui/styles/typography.css'

import App from './App.vue'
import router from './router'
import vuesticGlobalConfig from './services/vuestic-ui/global-config'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createVuestic({ config: vuesticGlobalConfig }))

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('[Global Error]', err, info)
}

app.mount('#app')

// PWA Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed — app works fine without it
    })
  })
}
