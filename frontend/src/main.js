import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Handle initial route and ensure valid routes are loaded
router.isReady().then(() => {
  const currentRoute = router.currentRoute.value
  
  // If route is not found or doesn't match, redirect to home
  if (currentRoute.name === 'not-found' || !currentRoute.matched.length) {
    router.replace({ name: 'home' }).catch(() => {
      // Fallback: force navigation to home
      window.location.href = '/'
    })
  }
}).catch(() => {
  // If router fails to initialize, redirect to home
  window.location.href = '/'
})

app.mount('#app')
