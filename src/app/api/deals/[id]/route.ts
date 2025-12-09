import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET single deal
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
        const deal = await prisma.deal.findUnique({
            where: { id: numericId },
            include: {
                contact: true,
                company: true,
                activities: true,
            },
        })
        if (!deal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
        }
        return NextResponse.json(deal)
    } catch (error) {
        console.error('Error fetching deal:', error)
        return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 })
    }
}

// PUT update deal
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
        const deal = await prisma.deal.update({
            where: { id: numericId },
            data: {
                title: body.title,
                value: parseFloat(body.value),
                stage: body.stage,
                priority: body.priority,
                probability: parseInt(body.probability, 10),
                expectedClose: body.expectedClose ? new Date(body.expectedClose) : null,
                description: body.description || null,
                contactId: body.contactId ? parseInt(body.contactId, 10) : null,
                companyId: body.companyId ? parseInt(body.companyId, 10) : null,
            },
            include: {
                contact: true,
                company: true,
            },
        })
        return NextResponse.json(deal)
    } catch (error) {
        console.error('Error updating deal:', error)
        return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
    }
}

// DELETE deal
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
        await prisma.deal.delete({
            where: { id: numericId },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting deal:', error)
        return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
    }
}
