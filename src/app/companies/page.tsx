import { prisma } from '@/lib/prisma'
import CompaniesView from '@/components/CompaniesView'

async function getCompanies() {
    const companies = await prisma.company.findMany({
        include: {
            _count: {
                select: {
                    contacts: true,
                    deals: true,
                },
            },
            deals: {
                where: {
                    stage: {
                        notIn: ['closed-lost'],
                    },
                },
                select: {
                    value: true,
                    stage: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })
    return companies
}

export default async function CompaniesPage() {
    const companies = await getCompanies()

    return <CompaniesView companies={companies as any[]} />
}
