import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET all email templates
export async function GET() {
    try {
        const templates = await prisma.emailTemplate.findMany({
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(templates)
    } catch (error) {
        console.error('Error fetching templates:', error)
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }
}

// POST create email template
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const template = await prisma.emailTemplate.create({
            data: {
                name: body.name,
                subject: body.subject,
                body: body.body,
                type: body.type || 'custom',
            },
        })
        return NextResponse.json(template, { status: 201 })
    } catch (error) {
        console.error('Error creating template:', error)
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }
}
