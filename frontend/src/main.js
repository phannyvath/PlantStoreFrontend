import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Handle initial route if it's invalid
router.isReady().then(() => {
  const currentRoute = router.currentRoute.value
  if (currentRoute.name === 'not-found') {
    router.replace({ name: 'home' })
  }
})

app.mount('#app')
