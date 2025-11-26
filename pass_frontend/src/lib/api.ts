import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para tratamento de erros global (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aqui você pode adicionar lógica de tratamento de erros
    // Por exemplo, redirecionar para login em caso de 401
    return Promise.reject(error)
  }
)
