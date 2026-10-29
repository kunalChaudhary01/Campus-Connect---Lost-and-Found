import axios from 'axios'

// const api = axios.create({ baseURL: '/api' })
const api = axios.create({
  baseURL: 'https://campus-connectt-akhd.onrender.com/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campus_connect_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 422].includes(error.response?.status)) {
      localStorage.removeItem('campus_connect_token')
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(error)
  }
)

export default api
