import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Generate invoice number like FAT-2025-001
async function generateInvoiceNumber() {
    const year = new Date().getFullYear()
    const count = await prisma.invoice.count({
        where: {
            number: {
                startsWith: `FAT-${year}`,
            },
        },
    })
    return `FAT-${year}-${String(count + 1).padStart(3, '0')}`
}

// GET all invoices
export async function GET() {
    try {
        const invoices = await prisma.invoice.findMany({
            include: {
                contact: {
                    select: { firstName: true, lastName: true, email: true },
                },
                proposal: {
                    select: { number: true, title: true },
                },
                items: true,
            },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(invoices)
    } catch (error) {
        console.error('Error fetching invoices:', error)
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
    }
}

// POST create invoice
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const number = await generateInvoiceNumber()

        // Calculate totals
        const items = body.items || []
        const subtotal = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) =>
            sum + item.quantity * item.unitPrice, 0)
        const taxRate = body.taxRate || 23
        const tax = subtotal * (taxRate / 100)
        const discount = body.discount || 0
        const total = subtotal + tax - discount

        const invoice = await prisma.invoice.create({
            data: {
                number,
                title: body.title,
                status: 'draft',
                issueDate: new Date(),
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
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
        return NextResponse.json(invoice, { status: 201 })
    } catch (error) {
        console.error('Error creating invoice:', error)
        return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
    }
}
