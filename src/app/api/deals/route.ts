import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// GET all deals
export async function GET() {
    try {
        const deals = await prisma.deal.findMany({
            include: {
                contact: true,
                company: true,
            },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(deals)
    } catch (error) {
        console.error('Error fetching deals:', error)
        return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
    }
}

// POST create deal
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const deal = await prisma.deal.create({
            data: {
                title: body.title,
                value: parseFloat(body.value),
                stage: body.stage || 'lead',
                probability: parseInt(body.probability, 10) || 20,
                expectedClose: body.expectedClose ? new Date(body.expectedClose) : null,
                priority: body.priority || 'medium',
                contactId: body.contactId ? parseInt(body.contactId, 10) : null,
                companyId: body.companyId ? parseInt(body.companyId, 10) : null,
            },
            include: {
                contact: true,
                company: true,
            },
        })
        revalidatePath('/deals')
        revalidatePath('/')
        return NextResponse.json(deal, { status: 201 })
    } catch (error) {
        console.error('Error creating deal:', error)
        return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
    }
}

