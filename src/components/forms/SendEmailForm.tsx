'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, User } from 'lucide-react'
import styles from './Forms.module.css'

interface Contact {
    id: string
    firstName: string
    lastName: string
    email: string
    companyName: string | null
}

interface EmailTemplate {
    id: string
    name: string
    subject: string
    body: string
    type: string
}

interface SendEmailFormProps {
    contacts: Contact[]
    templates: EmailTemplate[]
    onClose: () => void
    onSuccess: () => void
}

export default function SendEmailForm({ contacts, templates, onClose, onSuccess }: SendEmailFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        contactId: '',
        templateId: '',
        subject: '',
        body: '',
    })

    const selectedContact = contacts.find((c) => c.id === formData.contactId)
    const selectedTemplate = templates.find((t) => t.id === formData.templateId)

    const handleTemplateChange = (templateId: string) => {
        const template = templates.find((t) => t.id === templateId)
        setFormData({
            ...formData,
            templateId,
            subject: template?.subject || '',
            body: template?.body || '',
        })
    }

    const parseVariables = (text: string) => {
        if (!selectedContact) return text
        return text
            .replace(/{{firstName}}/g, selectedContact.firstName)
            .replace(/{{lastName}}/g, selectedContact.lastName)
            .replace(/{{email}}/g, selectedContact.email)
            .replace(/{{companyName}}/g, selectedContact.companyName || '')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedContact) return
        setLoading(true)

        try {
            const response = await fetch('/api/emails/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedContact.email,
                    subject: parseVariables(formData.subject),
                    html: parseVariables(formData.body),
                    contactId: formData.contactId,
                    templateId: formData.templateId || null,
                }),
            })

            if (response.ok) {
                onSuccess()
                router.refresh()
            }
        } catch (error) {
            console.error('Error sending email:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
                <label className={styles.label}>
                    <User size={14} /> Destinatário *
                </label>
                <select
                    className="form-input"
                    value={formData.contactId}
                    onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                    required
                >
                    <option value="">Selecionar contacto...</option>
                    {contacts.map((contact) => (
                        <option key={contact.id} value={contact.id}>
                            {contact.firstName} {contact.lastName} ({contact.email})
                            {contact.companyName && ` - ${contact.companyName}`}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Template (opcional)</label>
                <select
                    className="form-input"
                    value={formData.templateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                >
                    <option value="">Sem template</option>
                    {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                            {template.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Assunto *</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Assunto do email"
                    required
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Mensagem (HTML) *</label>
                <textarea
                    className="form-input"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={8}
                    placeholder="<h2>Olá {{firstName}},</h2><p>...</p>"
                    required
                />
                <small className="text-muted">
                    Variáveis: {'{{firstName}}'}, {'{{lastName}}'}, {'{{companyName}}'}
                </small>
            </div>

            {selectedContact && (
                <div className="card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                    <strong>Pré-visualização:</strong>
                    <p style={{ marginTop: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
                        Para: {selectedContact.email}
                    </p>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Assunto: {parseVariables(formData.subject)}
                    </p>
                </div>
            )}

            <div className={styles.actions}>
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || !selectedContact}>
                    <Send size={16} />
                    {loading ? 'A enviar...' : 'Enviar Email'}
                </button>
            </div>
        </form>
    )
}
