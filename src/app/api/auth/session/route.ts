import { getSession } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const user = await getSession()

        if (!user) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        return NextResponse.json({ authenticated: true, user })
    } catch (error) {
        console.error('Session error:', error)
        return NextResponse.json(
            { error: 'Erro ao verificar sessão' },
            { status: 500 }
        )
    }
}
