'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Forms.module.css'

interface CompanyFormProps {
    company?: {
        id: string
        name: string
        industry: string
        website: string | null
        phone: string | null
        address: string | null
    }
    onClose: () => void
    onSuccess: () => void
}

const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Retail',
    'Manufacturing',
    'Education',
    'Real Estate',
    'Consulting',
    'Other',
]

export default function CompanyForm({ company, onClose, onSuccess }: CompanyFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: company?.name || '',
        industry: company?.industry || 'Technology',
        website: company?.website || '',
        phone: company?.phone || '',
        address: company?.address || '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = company ? `/api/companies/${company.id}` : '/api/companies'
            const method = company ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                onSuccess()
                router.refresh()
            }
        } catch (error) {
            console.error('Error saving company:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
                <label className={styles.label}>Company Name *</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Industry *</label>
                    <select
                        className="form-input"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        required
                    >
                        {industries.map((ind) => (
                            <option key={ind} value={ind}>{ind}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Phone</label>
                    <input
                        type="tel"
                        className="form-input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Website</label>
                <input
                    type="url"
                    className="form-input"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://"
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Address</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
            </div>

            <div className={styles.actions}>
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : company ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    )
}
