'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Forms.module.css'

interface Company {
    id: string
    name: string
}

interface Contact {
    id: string
    firstName: string
    lastName: string
}

interface DealFormProps {
    deal?: {
        id: string
        title: string
        value: number
        stage: string
        probability: number
        expectedClose: Date | null
        priority: string
        contactId: string | null
        companyId: string | null
    }
    companies: Company[]
    contacts: Contact[]
    onClose: () => void
    onSuccess: () => void
}

const stages = [
    { id: 'lead', label: 'Lead' },
    { id: 'qualified', label: 'Qualified' },
    { id: 'proposal', label: 'Proposal' },
    { id: 'negotiation', label: 'Negotiation' },
    { id: 'closed-won', label: 'Closed Won' },
    { id: 'closed-lost', label: 'Closed Lost' },
]

export default function DealForm({ deal, companies, contacts, onClose, onSuccess }: DealFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: deal?.title || '',
        value: deal?.value || 0,
        stage: deal?.stage || 'lead',
        probability: deal?.probability || 20,
        expectedClose: deal?.expectedClose ? new Date(deal.expectedClose).toISOString().split('T')[0] : '',
        priority: deal?.priority || 'medium',
        contactId: deal?.contactId || '',
        companyId: deal?.companyId || '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = deal ? `/api/deals/${deal.id}` : '/api/deals'
            const method = deal ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    value: Number(formData.value),
                    probability: Number(formData.probability),
                    contactId: formData.contactId || null,
                    companyId: formData.companyId || null,
                    expectedClose: formData.expectedClose || null,
                }),
            })

            if (response.ok) {
                onSuccess()
                router.refresh()
            }
        } catch (error) {
            console.error('Error saving deal:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
                <label className={styles.label}>Deal Title *</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Value ($) *</label>
                    <input
                        type="number"
                        className="form-input"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                        required
                        min="0"
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Probability (%)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={formData.probability}
                        onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                        min="0"
                        max="100"
                    />
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Stage</label>
                    <select
                        className="form-input"
                        value={formData.stage}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    >
                        {stages.map((s) => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Priority</label>
                    <select
                        className="form-input"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Expected Close Date</label>
                <input
                    type="date"
                    className="form-input"
                    value={formData.expectedClose}
                    onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Company</label>
                    <select
                        className="form-input"
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    >
                        <option value="">No company</option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Contact</label>
                    <select
                        className="form-input"
                        value={formData.contactId}
                        onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                    >
                        <option value="">No contact</option>
                        {contacts.map((c) => (
                            <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.actions}>
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : deal ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    )
}
