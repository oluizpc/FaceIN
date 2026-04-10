import api from './client'

export const listarEscolas   = ()           => api.get('/escolas/')
export const buscarEscola    = (id)         => api.get(`/escolas/${id}`)
export const criarEscola     = (dados)      => api.post('/escolas/', dados)
export const atualizarEscola = (id, dados)  => api.put(`/escolas/${id}`, dados)
export const desativarEscola = (id)         => api.delete(`/escolas/${id}`)
