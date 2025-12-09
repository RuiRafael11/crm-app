import { prisma } from '@/lib/prisma'
import ProposalsView from '@/components/ProposalsView'

async function getProposalsData() {
    const [proposals, contacts, deals] = await Promise.all([
        prisma.proposal.findMany({
            include: {
                contact: {
                    select: { firstName: true, lastName: true, email: true },
                },
                deal: {
                    select: { title: true },
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
        prisma.deal.findMany({
            orderBy: { title: 'asc' },
        }),
    ])

    return { proposals, contacts, deals }
}

export default async function ProposalsPage() {
    const data = await getProposalsData()

    const serializedData = {
        proposals: data.proposals.map((p) => ({
            ...p,
            id: String(p.id),
            contactId: p.contactId ? String(p.contactId) : null,
            dealId: p.dealId ? String(p.dealId) : null,
            validUntil: p.validUntil?.toISOString() || null,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
            items: p.items.map((item) => ({
                ...item,
                id: String(item.id),
                proposalId: String(item.proposalId),
            })),
        })),
        contacts: data.contacts.map((c) => ({
            id: String(c.id),
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            companyName: c.company?.name || null,
        })),
        deals: data.deals.map((d) => ({
            id: String(d.id),
            title: d.title,
            value: d.value,
        })),
    }

    return <ProposalsView data={serializedData} />
}
