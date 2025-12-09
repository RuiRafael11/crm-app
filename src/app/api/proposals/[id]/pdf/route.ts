import { prisma } from '@/lib/prisma'
import { generateProposalPDF } from '@/lib/pdf'
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

        const proposal = await prisma.proposal.findUnique({
            where: { id: numericId },
            include: {
                contact: {
                    select: { firstName: true, lastName: true, email: true },
                },
                items: true,
            },
        })

        if (!proposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
        }

        const pdfData = generateProposalPDF({
            number: proposal.number,
            title: proposal.title,
            validUntil: proposal.validUntil?.toISOString(),
            notes: proposal.notes,
            subtotal: proposal.subtotal,
            discount: proposal.discount,
            total: proposal.total,
            contact: proposal.contact,
            items: proposal.items,
            createdAt: proposal.createdAt.toISOString(),
        })

        return new NextResponse(pdfData, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${proposal.number}.pdf"`,
            },
        })
    } catch (error) {
        console.error('Error generating proposal PDF:', error)
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
    }
}
