import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const salvo = localStorage.getItem('facein_usuario')
      return salvo ? JSON.parse(salvo) : null
    } catch {
      return null
    }
  })

  function login(token, usuarioData) {
    localStorage.setItem('facein_token', token)
    localStorage.setItem('facein_usuario', JSON.stringify(usuarioData))
    setUsuario(usuarioData)
  }

  function logout() {
    localStorage.removeItem('facein_token')
    localStorage.removeItem('facein_usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, autenticado: !!usuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
