import { prisma } from '@/lib/prisma'
import ActivitiesView from '@/components/ActivitiesView'

async function getActivitiesData() {
  const [activities, contacts, deals] = await Promise.all([
    prisma.activity.findMany({
      include: {
        contact: true,
        deal: true,
      },
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
      ],
    }),
    prisma.contact.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: 'asc' },
    }),
    prisma.deal.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
  ])
  return { activities, contacts, deals }
}

export default async function ActivitiesPage() {
  const { activities, contacts, deals } = await getActivitiesData()

  return (
    <ActivitiesView
      activities={activities as any[]}
      contacts={contacts.map(c => ({ id: String(c.id), firstName: c.firstName, lastName: c.lastName }))}
      deals={deals.map(d => ({ id: String(d.id), title: d.title }))}
    />
  )
}
