import api from './client'

export const listarAlunos      = ()           => api.get('/alunos/')
export const buscarAluno       = (id)         => api.get(`/alunos/${id}`)
export const criarAluno        = (dados)      => api.post('/alunos/', dados)
export const atualizarAluno    = (id, dados)  => api.put(`/alunos/${id}`, dados)
export const desativarAluno    = (id)         => api.delete(`/alunos/${id}`)
export const cadastrarFace     = (id, form)   => api.post(`/reconhecimento/cadastrar-face/${id}`, form)
