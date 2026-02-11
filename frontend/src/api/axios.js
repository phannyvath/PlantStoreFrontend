import axios from 'axios'

// Use environment variable for API URL, fallback to relative path for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Debug: Always log the API URL being used (helps debug production issues)
console.log('🔧 API Base URL:', API_BASE_URL)
console.log('🔧 VITE_API_URL env:', import.meta.env.VITE_API_URL || 'NOT SET')

// Warn if using relative path in production
if (API_BASE_URL === '/api') {
  console.warn('⚠️ WARNING: Using relative API path (/api). This will not work in production!')
  console.warn('⚠️ Set VITE_API_URL environment variable in Vercel to: https://backendpstore.onrender.com/api')
}

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
