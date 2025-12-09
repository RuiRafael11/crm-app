import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET single activity
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
        const activity = await prisma.activity.findUnique({
            where: { id: numericId },
            include: {
                contact: true,
                deal: true,
            },
        })
        if (!activity) {
            return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
        }
        return NextResponse.json(activity)
    } catch (error) {
        console.error('Error fetching activity:', error)
        return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
    }
}

// PUT update activity
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
        const activity = await prisma.activity.update({
            where: { id: numericId },
            data: {
                type: body.type,
                title: body.title,
                description: body.description || null,
                completed: body.completed,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                contactId: body.contactId ? parseInt(body.contactId, 10) : null,
                dealId: body.dealId ? parseInt(body.dealId, 10) : null,
            },
            include: {
                contact: true,
                deal: true,
            },
        })
        return NextResponse.json(activity)
    } catch (error) {
        console.error('Error updating activity:', error)
        return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
    }
}

// DELETE activity
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
        await prisma.activity.delete({
            where: { id: numericId },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting activity:', error)
        return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 })
    }
}
