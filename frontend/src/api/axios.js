import axios from 'axios'

// Use environment variable for API URL, fallback to relative path for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Handle network errors (backend not available)
    if (!err.response && err.message === 'Network Error') {
      console.warn('Backend API is not available. Please check your API configuration.')
      // Don't redirect on network errors - let the UI handle it gracefully
      return Promise.reject(err)
    }
    
    // Handle 401 unauthorized
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
