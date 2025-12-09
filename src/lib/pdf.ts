import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ProposalItem {
    description: string
    quantity: number
    unitPrice: number
    total: number
}

interface Proposal {
    number: string
    title: string
    validUntil?: string | null
    notes?: string | null
    subtotal: number
    discount: number
    total: number
    contact?: {
        firstName: string
        lastName: string
        email: string
    } | null
    items: ProposalItem[]
    createdAt: string
}

interface InvoiceItem {
    description: string
    quantity: number
    unitPrice: number
    total: number
}

interface Invoice {
    number: string
    title: string
    status: string
    issueDate: string
    dueDate?: string | null
    notes?: string | null
    subtotal: number
    tax: number
    taxRate: number
    discount: number
    total: number
    contact?: {
        firstName: string
        lastName: string
        email: string
    } | null
    items: InvoiceItem[]
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
    }).format(value)
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

export function generateProposalPDF(proposal: Proposal): ArrayBuffer {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(24)
    doc.setTextColor(99, 102, 241) // Purple
    doc.text('PROPOSTA', 20, 30)

    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(proposal.number, 20, 40)

    // Company info (right side)
    doc.setFontSize(10)
    doc.setTextColor(60)
    doc.text('CRM Pro', 150, 25, { align: 'right' })
    doc.text('A sua Agência Web', 150, 32, { align: 'right' })

    // Line separator
    doc.setDrawColor(200)
    doc.line(20, 50, 190, 50)

    // Client info
    doc.setFontSize(11)
    doc.setTextColor(40)
    doc.text('CLIENTE:', 20, 65)

    if (proposal.contact) {
        doc.setFontSize(10)
        doc.text(`${proposal.contact.firstName} ${proposal.contact.lastName}`, 20, 72)
        doc.text(proposal.contact.email, 20, 79)
    }

    // Proposal info (right)
    doc.text('Data:', 130, 65)
    doc.text(formatDate(proposal.createdAt), 150, 65)
    if (proposal.validUntil) {
        doc.text('Válido até:', 130, 72)
        doc.text(formatDate(proposal.validUntil), 150, 72)
    }

    // Title
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text(proposal.title, 20, 95)

    // Items table
    autoTable(doc, {
        startY: 105,
        head: [['Descrição', 'Qtd', 'Preço Unit.', 'Total']],
        body: proposal.items.map((item) => [
            item.description,
            item.quantity.toString(),
            formatCurrency(item.unitPrice),
            formatCurrency(item.total),
        ]),
        headStyles: {
            fillColor: [99, 102, 241],
            textColor: 255,
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [245, 245, 250],
        },
        columnStyles: {
            0: { cellWidth: 90 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' },
        },
    })

    // Totals
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

    doc.setFontSize(10)
    doc.text('Subtotal:', 140, finalY)
    doc.text(formatCurrency(proposal.subtotal), 190, finalY, { align: 'right' })

    if (proposal.discount > 0) {
        doc.text('Desconto:', 140, finalY + 7)
        doc.text(`-${formatCurrency(proposal.discount)}`, 190, finalY + 7, { align: 'right' })
    }

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', 140, finalY + 17)
    doc.setTextColor(99, 102, 241)
    doc.text(formatCurrency(proposal.total), 190, finalY + 17, { align: 'right' })

    // Notes
    if (proposal.notes) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(100)
        doc.text('Notas:', 20, finalY + 35)
        doc.text(proposal.notes, 20, finalY + 42, { maxWidth: 170 })
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('Gerado automaticamente pelo CRM Pro', 105, 285, { align: 'center' })

    return doc.output('arraybuffer')
}

export function generateInvoicePDF(invoice: Invoice): ArrayBuffer {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(24)
    doc.setTextColor(16, 185, 129) // Green
    doc.text('FATURA', 20, 30)

    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(invoice.number, 20, 40)

    // Status badge
    const statusColors: Record<string, [number, number, number]> = {
        draft: [156, 163, 175],
        sent: [59, 130, 246],
        paid: [16, 185, 129],
        overdue: [239, 68, 68],
    }
    const color = statusColors[invoice.status] || statusColors.draft
    doc.setFillColor(...color)
    doc.roundedRect(150, 25, 40, 10, 2, 2, 'F')
    doc.setFontSize(8)
    doc.setTextColor(255)
    const statusLabels: Record<string, string> = {
        draft: 'RASCUNHO',
        sent: 'ENVIADA',
        paid: 'PAGA',
        overdue: 'VENCIDA',
    }
    doc.text(statusLabels[invoice.status] || invoice.status.toUpperCase(), 170, 31, { align: 'center' })

    // Line separator
    doc.setDrawColor(200)
    doc.line(20, 50, 190, 50)

    // Client info
    doc.setFontSize(11)
    doc.setTextColor(40)
    doc.text('CLIENTE:', 20, 65)

    if (invoice.contact) {
        doc.setFontSize(10)
        doc.text(`${invoice.contact.firstName} ${invoice.contact.lastName}`, 20, 72)
        doc.text(invoice.contact.email, 20, 79)
    }

    // Invoice info (right)
    doc.text('Emissão:', 130, 65)
    doc.text(formatDate(invoice.issueDate), 155, 65)
    if (invoice.dueDate) {
        doc.text('Vencimento:', 130, 72)
        doc.text(formatDate(invoice.dueDate), 155, 72)
    }

    // Title
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text(invoice.title, 20, 95)

    // Items table
    autoTable(doc, {
        startY: 105,
        head: [['Descrição', 'Qtd', 'Preço Unit.', 'Total']],
        body: invoice.items.map((item) => [
            item.description,
            item.quantity.toString(),
            formatCurrency(item.unitPrice),
            formatCurrency(item.total),
        ]),
        headStyles: {
            fillColor: [16, 185, 129],
            textColor: 255,
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [240, 253, 244],
        },
        columnStyles: {
            0: { cellWidth: 90 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' },
        },
    })

    // Totals
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

    doc.setFontSize(10)
    doc.setTextColor(60)
    doc.text('Subtotal:', 140, finalY)
    doc.text(formatCurrency(invoice.subtotal), 190, finalY, { align: 'right' })

    doc.text(`IVA (${invoice.taxRate}%):`, 140, finalY + 7)
    doc.text(formatCurrency(invoice.tax), 190, finalY + 7, { align: 'right' })

    if (invoice.discount > 0) {
        doc.text('Desconto:', 140, finalY + 14)
        doc.text(`-${formatCurrency(invoice.discount)}`, 190, finalY + 14, { align: 'right' })
    }

    const totalY = invoice.discount > 0 ? finalY + 24 : finalY + 17
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', 140, totalY)
    doc.setTextColor(16, 185, 129)
    doc.text(formatCurrency(invoice.total), 190, totalY, { align: 'right' })

    // Notes
    if (invoice.notes) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(100)
        doc.text('Notas:', 20, totalY + 20)
        doc.text(invoice.notes, 20, totalY + 27, { maxWidth: 170 })
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('Gerado automaticamente pelo CRM Pro', 105, 285, { align: 'center' })

    return doc.output('arraybuffer')
}
