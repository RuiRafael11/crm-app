import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET email logs (with optional contactId filter)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const contactId = searchParams.get('contactId')

        const where = contactId ? { contactId: parseInt(contactId, 10) } : {}

        const logs = await prisma.emailLog.findMany({
            where,
            include: {
                contact: {
                    select: { firstName: true, lastName: true, email: true },
                },
                template: {
                    select: { name: true },
                },
            },
            orderBy: { sentAt: 'desc' },
            take: 50,
        })
        return NextResponse.json(logs)
    } catch (error) {
        console.error('Error fetching email logs:', error)
        return NextResponse.json({ error: 'Failed to fetch email logs' }, { status: 500 })
    }
}
