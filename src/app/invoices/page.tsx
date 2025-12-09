import { prisma } from '@/lib/prisma'
import InvoicesView from '@/components/InvoicesView'

async function getInvoicesData() {
    const [invoices, contacts, proposals] = await Promise.all([
        prisma.invoice.findMany({
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
        }),
        prisma.contact.findMany({
            include: {
                company: {
                    select: { name: true },
                },
            },
            orderBy: { firstName: 'asc' },
        }),
        prisma.proposal.findMany({
            include: {
                items: true,
                contact: { select: { firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
    ])

    return { invoices, contacts, proposals }
}

export default async function InvoicesPage() {
    const data = await getInvoicesData()

    const serializedData = {
        invoices: data.invoices.map((inv) => ({
            ...inv,
            id: String(inv.id),
            contactId: inv.contactId ? String(inv.contactId) : null,
            proposalId: inv.proposalId ? String(inv.proposalId) : null,
            issueDate: inv.issueDate.toISOString(),
            dueDate: inv.dueDate?.toISOString() || null,
            paidDate: inv.paidDate?.toISOString() || null,
            createdAt: inv.createdAt.toISOString(),
            updatedAt: inv.updatedAt.toISOString(),
            items: inv.items.map((item) => ({
                ...item,
                id: String(item.id),
                invoiceId: String(item.invoiceId),
            })),
        })),
        contacts: data.contacts.map((c) => ({
            id: String(c.id),
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            companyName: c.company?.name || null,
        })),
        proposals: data.proposals.map((p) => ({
            id: String(p.id),
            number: p.number,
            title: p.title,
            total: p.total,
        })),
    }

    return <InvoicesView data={serializedData} />
}
