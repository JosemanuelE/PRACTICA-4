export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000"

export const ADMIN_TOKEN_KEY = "cpanel_admin_token"
export const USER_TOKEN_KEY = "user_token"

export const USER_INFO_KEY = "user_info"

export type SessionUser = {
    id: number
    name: string
    email: string
    role: string
    emailVerified?: boolean
}

export const getUserToken = () => localStorage.getItem(USER_TOKEN_KEY)
export const setUserToken = (token: string) => localStorage.setItem(USER_TOKEN_KEY, token)
export const isLoggedIn = () => Boolean(getUserToken())

export const setSessionUser = (user: SessionUser) =>
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user))

export const getSessionUser = (): SessionUser | null => {
    const raw = localStorage.getItem(USER_INFO_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as SessionUser
    } catch {
        return null
    }
}

export const removeUserToken = () => {
    localStorage.removeItem(USER_TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
}

// Consulta al backend quién es el dueño del token. Devuelve null si la sesión ya no vale.
export const fetchSessionUser = async (): Promise<SessionUser | null> => {
    const token = getUserToken()
    if (!token) return null
    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return null
        const data = await res.json()
        if (!data?.user) return null
        setSessionUser(data.user as SessionUser)
        return data.user as SessionUser
    } catch {
        return null
    }
}
