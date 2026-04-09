import api from './client'

export const listarPorAluno      = (alunoId)          => api.get(`/responsaveis/aluno/${alunoId}`)
export const criarResponsavel    = (alunoId, dados)   => api.post(`/responsaveis/aluno/${alunoId}`, dados)
export const atualizarResponsavel= (id, dados)        => api.put(`/responsaveis/${id}`, dados)
export const deletarResponsavel  = (id)               => api.delete(`/responsaveis/${id}`)
