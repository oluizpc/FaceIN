import api from './client'

export const login           = (dados)  => api.post('/auth/login', dados)
export const me              = ()       => api.get('/auth/me')
export const registrar       = (dados)  => api.post('/auth/registro', dados)
export const primeiroAdmin   = (dados)  => api.post('/auth/primeiro-admin', dados)
export const listarUsuarios  = ()       => api.get('/auth/usuarios')
export const desativarUsuario = (id)   => api.delete(`/auth/usuarios/${id}`)
