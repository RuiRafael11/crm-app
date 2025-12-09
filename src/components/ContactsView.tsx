'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
    Mail,
    Phone,
    Building2,
    User,
    Edit,
    Trash2,
} from 'lucide-react'
import Header from '@/components/Header'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import ContactForm from '@/components/forms/ContactForm'
import styles from '@/app/contacts/page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSearch } from '@/contexts/SearchContext'
import { useToast } from '@/components/Toast'

interface Contact {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    position: string | null
    status: string
    avatar: string | null
    companyId: string | null
    company: { name: string } | null
    _count: { deals: number; activities: number }
}

interface Company {
    id: string
    name: string
}

interface ContactsViewProps {
    contacts: Contact[]
    companies: Company[]
}

function getStatusBadgeClass(status: string) {
    switch (status) {
        case 'active':
            return 'badge-success'
        case 'lead':
            return 'badge-info'
        case 'inactive':
            return 'badge-warning'
        default:
            return 'badge-primary'
    }
}

export default function ContactsView({ contacts, companies }: ContactsViewProps) {
    const { t } = useLanguage()
    const { searchQuery } = useSearch()
    const { showToast } = useToast()
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingContact, setEditingContact] = useState<Contact | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; contact: Contact | null }>({
        isOpen: false,
        contact: null,
    })
    const [isDeleting, setIsDeleting] = useState(false)

    // Filter contacts based on search query
    const filteredContacts = useMemo(() => {
        if (!searchQuery.trim()) return contacts
        const query = searchQuery.toLowerCase()
        return contacts.filter((contact) =>
            `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(query) ||
            contact.email.toLowerCase().includes(query) ||
            contact.position?.toLowerCase().includes(query) ||
            contact.company?.name.toLowerCase().includes(query)
        )
    }, [contacts, searchQuery])

    const handleAdd = () => {
        setEditingContact(null)
        setIsModalOpen(true)
    }

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (contact: Contact) => {
        setDeleteConfirm({ isOpen: true, contact })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.contact) return
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/contacts/${deleteConfirm.contact.id}`, { method: 'DELETE' })
            if (response.ok) {
                showToast(t('contactDeleted'), 'success')
                router.refresh()
            } else {
                showToast(t('errorOccurred'), 'error')
            }
        } catch {
            showToast(t('errorOccurred'), 'error')
        } finally {
            setIsDeleting(false)
            setDeleteConfirm({ isOpen: false, contact: null })
        }
    }

    const handleSuccess = (isEdit: boolean) => {
        setIsModalOpen(false)
        setEditingContact(null)
        showToast(isEdit ? t('contactUpdated') : t('contactCreated'), 'success')
    }

    return (
        <>
            <Header
                title={t('contacts')}
                subtitle={`${filteredContacts.length} ${t('contactsInDatabase')}`}
                showAddButton
                addButtonLabel={t('addContact')}
                onAddClick={handleAdd}
            />

            <div className={styles.contactsGrid}>
                {filteredContacts.map((contact, index) => (
                    <div
                        key={contact.id}
                        className={`${styles.contactCard} card fade-in stagger-${(index % 5) + 1}`}
                    >
                        <div className={styles.contactHeader}>
                            <img
                                src={contact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.email}`}
                                alt={`${contact.firstName} ${contact.lastName}`}
                                className="avatar avatar-lg"
                            />
                            <div className={styles.cardActions}>
                                <button
                                    className="btn btn-icon btn-ghost"
                                    onClick={() => handleEdit(contact)}
                                    title={t('edit')}
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    className="btn btn-icon btn-ghost"
                                    onClick={() => handleDeleteClick(contact)}
                                    title={t('delete')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.contactBody}>
                            <h3 className={styles.contactName}>
                                {contact.firstName} {contact.lastName}
                            </h3>
                            <p className={styles.contactPosition}>{contact.position || 'No position'}</p>

                            <span className={`badge ${getStatusBadgeClass(contact.status)}`}>
                                {contact.status}
                            </span>

                            {contact.company && (
                                <div className={styles.contactCompany}>
                                    <Building2 size={14} />
                                    <span>{contact.company.name}</span>
                                </div>
                            )}

                            <div className={styles.contactInfo}>
                                <a href={`mailto:${contact.email}`} className={styles.contactInfoItem}>
                                    <Mail size={14} />
                                    <span>{contact.email}</span>
                                </a>
                                {contact.phone && (
                                    <a href={`tel:${contact.phone}`} className={styles.contactInfoItem}>
                                        <Phone size={14} />
                                        <span>{contact.phone}</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className={styles.contactFooter}>
                            <div className={styles.contactStat}>
                                <span className={styles.statValue}>{contact._count.deals}</span>
                                <span className={styles.statLabel}>{t('deals')}</span>
                            </div>
                            <div className={styles.contactStat}>
                                <span className={styles.statValue}>{contact._count.activities}</span>
                                <span className={styles.statLabel}>{t('activities')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredContacts.length === 0 && (
                <div className="empty-state card">
                    <User size={64} className="empty-state-icon" />
                    <h3 className="empty-state-title">{searchQuery ? t('noResults') : t('noContacts')}</h3>
                    <p className="empty-state-description">
                        {searchQuery ? '' : t('addFirstContact')}
                    </p>
                    {!searchQuery && (
                        <button className="btn btn-primary mt-md" onClick={handleAdd}>{t('addContact')}</button>
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingContact ? t('edit') + ' ' + t('contacts') : t('addContact')}
            >
                <ContactForm
                    contact={editingContact || undefined}
                    companies={companies}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => handleSuccess(!!editingContact)}
                />
            </Modal>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, contact: null })}
                onConfirm={handleDeleteConfirm}
                title={t('delete') + ' ' + t('contacts')}
                message={`Are you sure you want to delete ${deleteConfirm.contact?.firstName} ${deleteConfirm.contact?.lastName}? This action cannot be undone.`}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                loading={isDeleting}
            />
        </>
    )
}
