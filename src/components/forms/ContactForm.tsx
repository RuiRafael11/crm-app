'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './Forms.module.css'

interface Company {
    id: string
    name: string
}

interface ContactFormProps {
    contact?: {
        id: string
        firstName: string
        lastName: string
        email: string
        phone: string | null
        position: string | null
        status: string
        companyId: string | null
    }
    companies: Company[]
    onClose: () => void
    onSuccess: () => void
}

export default function ContactForm({ contact, companies, onClose, onSuccess }: ContactFormProps) {
    const router = useRouter()
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        firstName: contact?.firstName || '',
        lastName: contact?.lastName || '',
        email: contact?.email || '',
        phone: contact?.phone || '',
        position: contact?.position || '',
        status: contact?.status || 'lead',
        companyId: contact?.companyId || '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = contact ? `/api/contacts/${contact.id}` : '/api/contacts'
            const method = contact ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    companyId: formData.companyId || null,
                }),
            })

            if (response.ok) {
                onSuccess()
                router.refresh()
            }
        } catch (error) {
            console.error('Error saving contact:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>First Name *</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Last Name *</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Email *</label>
                <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Phone</label>
                    <input
                        type="tel"
                        className="form-input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Position</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    />
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Status</label>
                    <select
                        className="form-input"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="lead">Lead</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Company</label>
                    <select
                        className="form-input"
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    >
                        <option value="">No company</option>
                        {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.actions}>
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : contact ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    )
}
