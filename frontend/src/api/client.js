import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('facein_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('facein_token')
      localStorage.removeItem('facein_usuario')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
