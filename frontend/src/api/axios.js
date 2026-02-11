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
    if (!err.response) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        const errorMessage = API_BASE_URL === '/api' 
          ? 'Backend API is not configured. Please set VITE_API_URL environment variable.'
          : `Cannot connect to backend at ${API_BASE_URL}. Please check your API configuration.`
        console.error(errorMessage)
        // Return a more descriptive error
        return Promise.reject(new Error(errorMessage))
      }
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
