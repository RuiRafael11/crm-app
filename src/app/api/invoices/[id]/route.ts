import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET single invoice
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
        const invoice = await prisma.invoice.findUnique({
            where: { id: numericId },
            include: {
                contact: true,
                proposal: true,
                items: true,
            },
        })
        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }
        return NextResponse.json(invoice)
    } catch (error) {
        console.error('Error fetching invoice:', error)
        return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
    }
}

// PUT update invoice
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
        await prisma.invoiceItem.deleteMany({
            where: { invoiceId: numericId },
        })

        // Calculate totals
        const items = body.items || []
        const subtotal = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) =>
            sum + item.quantity * item.unitPrice, 0)
        const taxRate = body.taxRate || 23
        const tax = subtotal * (taxRate / 100)
        const discount = body.discount || 0
        const total = subtotal + tax - discount

        // Handle paid status
        let paidDate = null
        if (body.status === 'paid') {
            paidDate = body.paidDate ? new Date(body.paidDate) : new Date()
        }

        const invoice = await prisma.invoice.update({
            where: { id: numericId },
            data: {
                title: body.title,
                status: body.status,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                paidDate,
                notes: body.notes || null,
                subtotal,
                tax,
                taxRate,
                discount,
                total,
                contactId: body.contactId ? parseInt(body.contactId, 10) : null,
                proposalId: body.proposalId ? parseInt(body.proposalId, 10) : null,
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
                proposal: true,
                items: true,
            },
        })
        return NextResponse.json(invoice)
    } catch (error) {
        console.error('Error updating invoice:', error)
        return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
    }
}

// DELETE invoice
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
        await prisma.invoice.delete({
            where: { id: numericId },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting invoice:', error)
        return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
    }
}
