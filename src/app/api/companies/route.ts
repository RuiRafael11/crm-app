import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET all companies
export async function GET() {
    try {
        const companies = await prisma.company.findMany({
            include: {
                _count: {
                    select: {
                        contacts: true,
                        deals: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(companies)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
    }
}

// POST create company
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const company = await prisma.company.create({
            data: {
                name: body.name,
                industry: body.industry,
                website: body.website || null,
                phone: body.phone || null,
                address: body.address || null,
                logo: body.logo || null,
            },
        })
        return NextResponse.json(company, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
    }
}
