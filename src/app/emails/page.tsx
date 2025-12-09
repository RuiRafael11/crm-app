import { prisma } from '@/lib/prisma'
import EmailsView from '@/components/EmailsView'

async function getEmailData() {
    const [templates, logs, contacts] = await Promise.all([
        prisma.emailTemplate.findMany({
            orderBy: { createdAt: 'desc' },
        }),
        prisma.emailLog.findMany({
            include: {
                contact: {
                    select: { firstName: true, lastName: true, email: true },
                },
                template: {
                    select: { name: true },
                },
            },
            orderBy: { sentAt: 'desc' },
            take: 20,
        }),
        prisma.contact.findMany({
            include: {
                company: {
                    select: { name: true },
                },
            },
            orderBy: { firstName: 'asc' },
        }),
    ])

    return { templates, logs, contacts }
}

export default async function EmailsPage() {
    const data = await getEmailData()

    // Convert dates for client component
    const serializedData = {
        templates: data.templates.map((t) => ({
            ...t,
            id: String(t.id),
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
        })),
        logs: data.logs.map((l) => ({
            ...l,
            id: String(l.id),
            contactId: l.contactId ? String(l.contactId) : null,
            templateId: l.templateId ? String(l.templateId) : null,
            sentAt: l.sentAt.toISOString(),
        })),
        contacts: data.contacts.map((c) => ({
            id: String(c.id),
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            companyName: c.company?.name || null,
        })),
    }

    return <EmailsView data={serializedData} />
}
