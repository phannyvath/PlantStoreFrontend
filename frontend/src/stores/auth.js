import { defineStore } from 'pinia'
import api from '../api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => {
    let user = null
    try {
      const raw = localStorage.getItem('user')
      user = raw ? JSON.parse(raw) : null
    } catch {
      user = null
    }
    return {
      token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null,
      user,
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
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
