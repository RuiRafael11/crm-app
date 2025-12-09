import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Generate proposal number like PRO-2024-001
async function generateProposalNumber() {
    const year = new Date().getFullYear()
    const count = await prisma.proposal.count({
        where: {
            number: {
                startsWith: `PRO-${year}`,
            },
        },
    })
    return `PRO-${year}-${String(count + 1).padStart(3, '0')}`
}

// GET all proposals
export async function GET() {
    try {
        const proposals = await prisma.proposal.findMany({
            include: {
                contact: {
                    select: { firstName: true, lastName: true, email: true },
                },
                deal: {
                    select: { title: true },
                },
                items: true,
            },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(proposals)
    } catch (error) {
        console.error('Error fetching proposals:', error)
        return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
    }
}

// POST create proposal
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const number = await generateProposalNumber()

        // Calculate totals
        const items = body.items || []
        const subtotal = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) =>
            sum + item.quantity * item.unitPrice, 0)
        const discount = body.discount || 0
        const total = subtotal - discount

        const proposal = await prisma.proposal.create({
            data: {
                number,
                title: body.title,
                description: body.description || null,
                status: 'draft',
                validUntil: body.validUntil ? new Date(body.validUntil) : null,
                notes: body.notes || null,
                subtotal,
                discount,
                total,
                contactId: body.contactId ? parseInt(body.contactId, 10) : null,
                dealId: body.dealId ? parseInt(body.dealId, 10) : null,
                items: {
                    create: items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.quantity * item.unitPrice,
                    })),
                },
            },
            include: {
                contact: true,
                deal: true,
                items: true,
            },
        })
        return NextResponse.json(proposal, { status: 201 })
    } catch (error) {
        console.error('Error creating proposal:', error)
        return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 })
    }
}
