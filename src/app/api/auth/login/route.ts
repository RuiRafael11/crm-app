import { login } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username e password são obrigatórios' },
                { status: 400 }
            )
        }

        const user = await login(username, password)

        if (!user) {
            return NextResponse.json(
                { error: 'Credenciais inválidas' },
                { status: 401 }
            )
        }

        return NextResponse.json({ success: true, user })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Erro no login' },
            { status: 500 }
        )
    }
}
