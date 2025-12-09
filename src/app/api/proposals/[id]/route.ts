import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET single proposal
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const numericId = parseInt(id, 10)
        if (isNaN(numericId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }
        const proposal = await prisma.proposal.findUnique({
            where: { id: numericId },
            include: {
                contact: true,
                deal: true,
                items: true,
            },
        })
        if (!proposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
        }
        return NextResponse.json(proposal)
    } catch (error) {
        console.error('Error fetching proposal:', error)
        return NextResponse.json({ error: 'Failed to fetch proposal' }, { status: 500 })
    }
}

// PUT update proposal
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const numericId = parseInt(id, 10)
        if (isNaN(numericId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }
        const body = await request.json()

        // Delete existing items and recreate
        await prisma.proposalItem.deleteMany({
            where: { proposalId: numericId },
        })

        // Calculate totals
        const items = body.items || []
        const subtotal = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) =>
            sum + item.quantity * item.unitPrice, 0)
        const discount = body.discount || 0
        const total = subtotal - discount

        const proposal = await prisma.proposal.update({
            where: { id: numericId },
            data: {
                title: body.title,
                description: body.description || null,
                status: body.status,
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
        return NextResponse.json(proposal)
    } catch (error) {
        console.error('Error updating proposal:', error)
        return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 })
    }
}

// DELETE proposal
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const numericId = parseInt(id, 10)
        if (isNaN(numericId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }
        await prisma.proposal.delete({
            where: { id: numericId },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting proposal:', error)
        return NextResponse.json({ error: 'Failed to delete proposal' }, { status: 500 })
    }
}
