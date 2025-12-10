import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// GET all contacts
export async function GET() {
    try {
        const contacts = await prisma.contact.findMany({
            include: {
                company: true,
                _count: {
                    select: {
                        deals: true,
                        activities: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(contacts)
    } catch (error) {
        console.error('Error fetching contacts:', error)
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
    }
}

// POST create contact
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const contact = await prisma.contact.create({
            data: {
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                phone: body.phone || null,
                position: body.position || null,
                status: body.status || 'lead',
                avatar: body.avatar || null,
                companyId: body.companyId ? parseInt(body.companyId, 10) : null,
            },
            include: {
                company: true,
            },
        })
        revalidatePath('/contacts')
        revalidatePath('/')
        return NextResponse.json(contact, { status: 201 })
    } catch (error) {
        console.error('Error creating contact:', error)
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
    }
}

