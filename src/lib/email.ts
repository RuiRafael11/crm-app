import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailParams {
    to: string
    subject: string
    html: string
    from?: string
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured')
        return { success: false, error: 'Email service not configured. Please add RESEND_API_KEY to .env' }
    }

    try {
        console.log('Sending email to:', to, 'subject:', subject)

        const { data, error } = await resend.emails.send({
            from: from || 'CRM Pro <onboarding@resend.dev>',
            to: [to],
            subject,
            html,
        })

        if (error) {
            console.error('Resend API error:', JSON.stringify(error, null, 2))
            // Provide user-friendly error messages
            let errorMessage = error.message
            if (error.message?.includes('not verified') || error.message?.includes('verify')) {
                errorMessage = 'Conta Resend gratuita: só pode enviar para o email verificado da conta. Verifica o teu email em resend.com'
            } else if (error.message?.includes('API key')) {
                errorMessage = 'API key do Resend inválida. Verifica RESEND_API_KEY no .env'
            }
            return { success: false, error: errorMessage }
        }

        console.log('Email sent successfully:', data)
        return { success: true, data }
    } catch (error) {
        console.error('Email exception:', error)
        return { success: false, error: 'Falha ao enviar email. Verifica os logs do servidor.' }
    }
}

// Parse template variables like {{firstName}}, {{companyName}}
export function parseTemplate(template: string, variables: Record<string, string>) {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    return result
}
