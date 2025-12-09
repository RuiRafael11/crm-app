import { cookies } from 'next/headers'

// Users - passwords from environment variables for security
const USERS = [
    { username: 'admin', password: process.env.ADMIN_PASSWORD || 'admin123', name: 'Administrador' },
    { username: 'rui', password: process.env.USER_PASSWORD || 'rui123', name: 'Rui Rafael' },
]

const SESSION_COOKIE = 'crm_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'crm-pro-secret-key-2024'

export interface User {
    username: string
    name: string
}

export async function login(username: string, password: string): Promise<User | null> {
    const user = USERS.find(u => u.username === username && u.password === password)

    if (!user) {
        return null
    }

    // Create session token (simple base64 encoding - in production use JWT)
    const sessionData = JSON.stringify({ username: user.username, name: user.name, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
    const token = Buffer.from(sessionData).toString('base64')

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
    })

    return { username: user.username, name: user.name }
}

export async function logout(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<User | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(SESSION_COOKIE)?.value

        if (!token) {
            return null
        }

        const sessionData = JSON.parse(Buffer.from(token, 'base64').toString())

        // Check expiration
        if (sessionData.exp < Date.now()) {
            await logout()
            return null
        }

        return { username: sessionData.username, name: sessionData.name }
    } catch {
        return null
    }
}

export function isValidSession(token: string): boolean {
    try {
        const sessionData = JSON.parse(Buffer.from(token, 'base64').toString())
        return sessionData.exp > Date.now()
    } catch {
        return false
    }
}
