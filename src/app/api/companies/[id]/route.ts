import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET single company
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const numericId = parseInt(id, 10)
        if (isNaN(numericId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }
        const company = await prisma.company.findUnique({
            where: { id: numericId },
            include: {
                contacts: true,
                deals: true,
            },
        })
        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 })
        }
        return NextResponse.json(company)
    } catch (error) {
        console.error('Error fetching company:', error)
        return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 })
    }
}

// PUT update company
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const numericId = parseInt(id, 10)
        if (isNaN(numericId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }
        const body = await request.json()
        const company = await prisma.company.update({
            where: { id: numericId },
            data: {
                name: body.name,
                industry: body.industry,
                website: body.website || null,
                phone: body.phone || null,
                address: body.address || null,
                logo: body.logo,
            },
        })
        return NextResponse.json(company)
    } catch (error) {
        console.error('Error updating company:', error)
        return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
    }
}

// DELETE company
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const numericId = parseInt(id, 10)
        if (isNaN(numericId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }
        await prisma.company.delete({
            where: { id: numericId },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting company:', error)
        return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 })
    }
}
