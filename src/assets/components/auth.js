const TOKEN_KEY = 'task_manager_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token)

export const clearToken = () => localStorage.removeItem(TOKEN_KEY)