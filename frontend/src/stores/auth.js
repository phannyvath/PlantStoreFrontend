import { defineStore } from 'pinia'
import api from '../api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => {
    let user = null
    let token = null
    
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('user')
        user = raw ? JSON.parse(raw) : null
        token = localStorage.getItem('token')
        
        // If token exists but user data is missing, clear both (invalid state)
        if (token && !user) {
          localStorage.removeItem('token')
          token = null
        }
        // If user exists but token is missing, clear user (invalid state)
        if (user && !token) {
          localStorage.removeItem('user')
          user = null
        }
      } catch {
        // If parsing fails, clear corrupted data
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        user = null
        token = null
      }
    }
    
    return {
      token,
      user,
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    userRole: (state) => state.user?.role,
  },
  actions: {
    setAuth(token, user) {
      this.token = token
      this.user = user
      if (token) localStorage.setItem('token', token)
      else localStorage.removeItem('token')
      if (user) localStorage.setItem('user', JSON.stringify(user))
      else localStorage.removeItem('user')
    },
    logout() {
      this.setAuth(null, null)
    },
    async fetchMe() {
      const { data } = await api.get('/auth/me')
      this.user = data.data
      localStorage.setItem('user', JSON.stringify(this.user))
    },
  },
})
