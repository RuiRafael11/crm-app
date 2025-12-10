import { prisma } from '@/lib/prisma'
import DealsView from '@/components/DealsView'

export const dynamic = 'force-dynamic'

async function getDealsData() {
  const [deals, companies, contacts] = await Promise.all([
    prisma.deal.findMany({
      include: {
        contact: true,
        company: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.company.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.contact.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: 'asc' },
    }),
  ])
  return { deals, companies, contacts }
}

export default async function DealsPage() {
  const { deals, companies, contacts } = await getDealsData()

  return (
    <DealsView
      deals={deals as any[]}
      companies={companies.map(c => ({ id: String(c.id), name: c.name }))}
      contacts={contacts.map(c => ({ id: String(c.id), firstName: c.firstName, lastName: c.lastName }))}
    />
  )
}
