import api from './client'

export const identificarFrame = (formData) =>
  api.post('/reconhecimento/identificar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
