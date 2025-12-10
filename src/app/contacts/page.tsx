import { prisma } from '@/lib/prisma'
import ContactsView from '@/components/ContactsView'

export const dynamic = 'force-dynamic'

async function getContactsData() {
  const [contacts, companies] = await Promise.all([
    prisma.contact.findMany({
      include: {
        company: true,
        _count: {
          select: {
            deals: true,
            activities: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.company.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])
  return { contacts, companies }
}

export default async function ContactsPage() {
  const { contacts, companies } = await getContactsData()

  return (
    <ContactsView
      contacts={contacts as any[]}
      companies={companies.map(c => ({ id: String(c.id), name: c.name }))}
    />
  )
}
