import { prisma } from '@/lib/prisma'
import { sendEmail, parseTemplate } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

// POST send email
export async function POST(request: NextRequest) {
    console.log('=== EMAIL SEND API CALLED ===')
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length)

    try {
        const body = await request.json()
        console.log('Request body:', JSON.stringify(body, null, 2))
        const { to, subject, html, contactId, templateId, variables } = body

        if (!to || !subject || !html) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, html' },
                { status: 400 }
            )
        }

        // Parse template variables if provided
        const parsedSubject = variables ? parseTemplate(subject, variables) : subject
        const parsedHtml = variables ? parseTemplate(html, variables) : html

        // Send the email
        const result = await sendEmail({
            to,
            subject: parsedSubject,
            html: parsedHtml,
        })

        // Log the email
        await prisma.emailLog.create({
            data: {
                to,
                subject: parsedSubject,
                body: parsedHtml,
                status: result.success ? 'sent' : 'failed',
                contactId: contactId ? parseInt(contactId, 10) : null,
                templateId: templateId ? parseInt(templateId, 10) : null,
            },
        })

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Email sent successfully' })
    } catch (error) {
        console.error('Error sending email:', error)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
}
