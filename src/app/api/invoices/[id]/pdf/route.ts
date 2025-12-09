import { prisma } from '@/lib/prisma'
import { generateInvoicePDF } from '@/lib/pdf'
import { NextRequest, NextResponse } from 'next/server'

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
                contact: {
                    select: { firstName: true, lastName: true, email: true },
                },
                items: true,
            },
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        const pdfData = generateInvoicePDF({
            number: invoice.number,
            title: invoice.title,
            status: invoice.status,
            issueDate: invoice.issueDate.toISOString(),
            dueDate: invoice.dueDate?.toISOString(),
            notes: invoice.notes,
            subtotal: invoice.subtotal,
            tax: invoice.tax,
            taxRate: invoice.taxRate,
            discount: invoice.discount,
            total: invoice.total,
            contact: invoice.contact,
            items: invoice.items,
        })

        return new NextResponse(pdfData, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${invoice.number}.pdf"`,
            },
        })
    } catch (error) {
        console.error('Error generating invoice PDF:', error)
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
    }
}
