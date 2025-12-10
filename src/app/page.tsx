import { prisma } from '@/lib/prisma'
import DashboardView from '@/components/DashboardView'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const [
    totalContacts,
    totalCompanies,
    deals,
    activities,
    recentActivities,
    upcomingTasks,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.company.count(),
    prisma.deal.findMany({
      include: {
        contact: true,
        company: true,
      },
    }),
    prisma.activity.count(),
    prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        contact: true,
        deal: true,
      },
    }),
    prisma.activity.findMany({
      where: {
        completed: false,
        dueDate: {
          gte: new Date(),
        },
      },
      take: 5,
      orderBy: { dueDate: 'asc' },
      include: {
        contact: true,
      },
    }),
  ])

  const activeDeals = deals.filter((d) => !['closed-won', 'closed-lost'].includes(d.stage))
  const totalRevenue = deals
    .filter((d) => d.stage === 'closed-won')
    .reduce((sum, d) => sum + d.value, 0)
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0)

  const dealsByStage = {
    lead: deals.filter((d) => d.stage === 'lead'),
    qualified: deals.filter((d) => d.stage === 'qualified'),
    proposal: deals.filter((d) => d.stage === 'proposal'),
    negotiation: deals.filter((d) => d.stage === 'negotiation'),
    'closed-won': deals.filter((d) => d.stage === 'closed-won'),
    'closed-lost': deals.filter((d) => d.stage === 'closed-lost'),
  }

  return {
    totalContacts,
    totalCompanies,
    activeDeals, // Changed to return filtered count appropriately in View or data prep
    // Correction: dashboard data needs activeDeals count
    activeDealsCount: activeDeals.length,
    totalRevenue,
    pipelineValue,
    totalTasks: activities,
    dealsByStage,
    recentActivities,
    upcomingTasks,
  }
}

export default async function Dashboard() {
  const rawData = await getDashboardData()

  // Adapt data for the view
  const data = {
    totalContacts: rawData.totalContacts,
    totalCompanies: rawData.totalCompanies,
    activeDeals: rawData.activeDealsCount,
    totalRevenue: rawData.totalRevenue,
    pipelineValue: rawData.pipelineValue,
    dealsByStage: rawData.dealsByStage,
    recentActivities: rawData.recentActivities as any[],
    upcomingTasks: rawData.upcomingTasks as any[]
  }

  return <DashboardView data={data} />
}
