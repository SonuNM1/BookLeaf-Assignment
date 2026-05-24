import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request Interceptor - runs before every req is sent, automatically attaches JWT token for localStorage

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') ; 

    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config ; 
})

// Response Interceptor - runs after every response comes back 

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login')

      if (!isLoginRequest) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api ; 