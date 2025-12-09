'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Forms.module.css'

interface Contact {
    id: string
    firstName: string
    lastName: string
}

interface Deal {
    id: string
    title: string
}

interface ActivityFormProps {
    activity?: {
        id: string
        title: string
        description: string | null
        type: string
        dueDate: Date | null
        completed: boolean
        contactId: string | null
        dealId: string | null
    }
    contacts: Contact[]
    deals: Deal[]
    onClose: () => void
    onSuccess: () => void
}

const activityTypes = [
    { id: 'call', label: 'Call' },
    { id: 'email', label: 'Email' },
    { id: 'meeting', label: 'Meeting' },
    { id: 'task', label: 'Task' },
]

export default function ActivityForm({ activity, contacts, deals, onClose, onSuccess }: ActivityFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: activity?.title || '',
        description: activity?.description || '',
        type: activity?.type || 'task',
        dueDate: activity?.dueDate ? new Date(activity.dueDate).toISOString().split('T')[0] : '',
        completed: activity?.completed || false,
        contactId: activity?.contactId || '',
        dealId: activity?.dealId || '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = activity ? `/api/activities/${activity.id}` : '/api/activities'
            const method = activity ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    contactId: formData.contactId || null,
                    dealId: formData.dealId || null,
                    dueDate: formData.dueDate || null,
                }),
            })

            if (response.ok) {
                onSuccess()
                router.refresh()
            }
        } catch (error) {
            console.error('Error saving activity:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
                <label className={styles.label}>Title *</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Type</label>
                    <select
                        className="form-input"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        {activityTypes.map((t) => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Due Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                </div>
            </div>

            <div className={styles.row}>
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
                <div className={styles.field}>
                    <label className={styles.label}>Deal</label>
                    <select
                        className="form-input"
                        value={formData.dealId}
                        onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
                    >
                        <option value="">No deal</option>
                        {deals.map((d) => (
                            <option key={d.id} value={d.id}>{d.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={formData.completed}
                        onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                    />
                    <span>Mark as completed</span>
                </label>
            </div>

            <div className={styles.actions}>
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : activity ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    )
}
