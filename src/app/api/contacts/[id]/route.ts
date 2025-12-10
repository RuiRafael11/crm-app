import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// GET single contact
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
        const contact = await prisma.contact.findUnique({
            where: { id: numericId },
            include: {
                company: true,
                deals: true,
                activities: true,
            },
        })
        if (!contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
        }
        return NextResponse.json(contact)
    } catch (error) {
        console.error('Error fetching contact:', error)
        return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 })
    }
}

// PUT update contact
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
        const contact = await prisma.contact.update({
            where: { id: numericId },
            data: {
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                phone: body.phone || null,
                position: body.position || null,
                status: body.status,
                avatar: body.avatar,
                companyId: body.companyId ? parseInt(body.companyId, 10) : null,
            },
            include: {
                company: true,
            },
        })
        revalidatePath('/contacts')
        revalidatePath('/')
        return NextResponse.json(contact)
    } catch (error) {
        console.error('Error updating contact:', error)
        return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
    }
}

// DELETE contact
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
        await prisma.contact.delete({
            where: { id: numericId },
        })
        revalidatePath('/contacts')
        revalidatePath('/')
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting contact:', error)
        return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
    }
}

