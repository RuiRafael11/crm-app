import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET single template
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
        const template = await prisma.emailTemplate.findUnique({
            where: { id: numericId },
        })
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }
        return NextResponse.json(template)
    } catch (error) {
        console.error('Error fetching template:', error)
        return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
    }
}

// PUT update template
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
        const template = await prisma.emailTemplate.update({
            where: { id: numericId },
            data: {
                name: body.name,
                subject: body.subject,
                body: body.body,
                type: body.type,
            },
        })
        return NextResponse.json(template)
    } catch (error) {
        console.error('Error updating template:', error)
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
    }
}

// DELETE template
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
        await prisma.emailTemplate.delete({
            where: { id: numericId },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting template:', error)
        return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
    }
}
