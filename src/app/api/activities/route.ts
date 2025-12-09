import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET all activities
export async function GET() {
    try {
        const activities = await prisma.activity.findMany({
            include: {
                contact: true,
                deal: true,
            },
            orderBy: [
                { completed: 'asc' },
                { dueDate: 'asc' },
            ],
        })
        return NextResponse.json(activities)
    } catch (error) {
        console.error('Error fetching activities:', error)
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }
}

// POST create activity
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const activity = await prisma.activity.create({
            data: {
                title: body.title,
                description: body.description || null,
                type: body.type || 'task',
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                completed: body.completed || false,
                contactId: body.contactId ? parseInt(body.contactId, 10) : null,
                dealId: body.dealId ? parseInt(body.dealId, 10) : null,
            },
            include: {
                contact: true,
                deal: true,
            },
        })
        return NextResponse.json(activity, { status: 201 })
    } catch (error) {
        console.error('Error creating activity:', error)
        return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
    }
}
