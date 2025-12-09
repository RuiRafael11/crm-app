'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
    Calendar,
    Building2,
    Flag,
    Edit,
    Trash2,
} from 'lucide-react'
import Header from '@/components/Header'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import DealForm from '@/components/forms/DealForm'
import styles from '@/app/deals/page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSearch } from '@/contexts/SearchContext'
import { useToast } from '@/components/Toast'

interface Deal {
    id: string
    title: string
    value: number
    stage: string
    priority: string
    probability: number
    expectedClose: Date | null
    contactId: string | null
    companyId: string | null
    contact: { firstName: string; lastName: string; email: string; avatar: string | null } | null
    company: { name: string } | null
}

interface Company {
    id: string
    name: string
}

interface Contact {
    id: string
    firstName: string
    lastName: string
}

interface DealsViewProps {
    deals: Deal[]
    companies: Company[]
    contacts: Contact[]
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

function formatDate(date: Date | null) {
    if (!date) return 'No date set'
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date))
}

const priorityStyles: Record<string, string> = {
    high: styles.priorityHigh,
    medium: styles.priorityMedium,
    low: styles.priorityLow,
}

export default function DealsView({ deals, companies, contacts }: DealsViewProps) {
    const { t } = useLanguage()
    const { searchQuery } = useSearch()
    const { showToast } = useToast()
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; deal: Deal | null }>({
        isOpen: false,
        deal: null,
    })
    const [isDeleting, setIsDeleting] = useState(false)

    const stages = [
        { id: 'lead', label: t('lead'), color: '#6366f1' },
        { id: 'qualified', label: t('qualified'), color: '#8b5cf6' },
        { id: 'proposal', label: t('proposal'), color: '#f59e0b' },
        { id: 'negotiation', label: t('negotiation'), color: '#3b82f6' },
        { id: 'closed-won', label: t('closedWon'), color: '#22c55e' },
        { id: 'closed-lost', label: t('closedLost'), color: '#ef4444' },
    ]

    const filteredDeals = useMemo(() => {
        if (!searchQuery.trim()) return deals
        const query = searchQuery.toLowerCase()
        return deals.filter((deal) =>
            deal.title.toLowerCase().includes(query) ||
            deal.company?.name.toLowerCase().includes(query) ||
            `${deal.contact?.firstName} ${deal.contact?.lastName}`.toLowerCase().includes(query)
        )
    }, [deals, searchQuery])

    const dealsByStage = stages.map((stage) => ({
        ...stage,
        deals: filteredDeals.filter((d) => d.stage === stage.id),
        total: filteredDeals
            .filter((d) => d.stage === stage.id)
            .reduce((sum, d) => sum + d.value, 0),
    }))

    const totalPipeline = filteredDeals
        .filter((d) => !['closed-won', 'closed-lost'].includes(d.stage))
        .reduce((sum, d) => sum + d.value, 0)

    const handleAdd = () => {
        setEditingDeal(null)
        setIsModalOpen(true)
    }

    const handleEdit = (deal: Deal) => {
        setEditingDeal(deal)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (deal: Deal) => {
        setDeleteConfirm({ isOpen: true, deal })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.deal) return
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/deals/${deleteConfirm.deal.id}`, { method: 'DELETE' })
            if (response.ok) {
                showToast(t('dealDeleted'), 'success')
                router.refresh()
            } else {
                showToast(t('errorOccurred'), 'error')
            }
        } catch {
            showToast(t('errorOccurred'), 'error')
        } finally {
            setIsDeleting(false)
            setDeleteConfirm({ isOpen: false, deal: null })
        }
    }

    const handleSuccess = (isEdit: boolean) => {
        setIsModalOpen(false)
        setEditingDeal(null)
        showToast(isEdit ? t('dealUpdated') : t('dealCreated'), 'success')
    }

    return (
        <>
            <Header
                title={t('dealsPipeline')}
                subtitle={`${formatCurrency(totalPipeline)} ${t('inActivePipeline')}`}
                showAddButton
                addButtonLabel={t('addDeal')}
                onAddClick={handleAdd}
            />

            <div className={styles.pipelineBoard}>
                {dealsByStage.map((stage) => (
                    <div key={stage.id} className={styles.pipelineColumn}>
                        <div className={styles.pipelineHeader}>
                            <div className={styles.pipelineTitle}>
                                <span
                                    className={styles.stageIndicator}
                                    style={{ background: stage.color }}
                                />
                                <span>{stage.label}</span>
                                <span className={styles.pipelineCount}>{stage.deals.length}</span>
                            </div>
                            <span className={styles.pipelineValue}>{formatCurrency(stage.total)}</span>
                        </div>

                        <div className={styles.pipelineCards}>
                            {stage.deals.map((deal) => (
                                <div key={deal.id} className={styles.dealCard}>
                                    <div className={styles.dealCardHeader}>
                                        <h4 className={styles.dealCardTitle}>{deal.title}</h4>
                                        <div className={styles.dealCardActions}>
                                            <button
                                                className="btn btn-icon btn-ghost btn-xs"
                                                onClick={() => handleEdit(deal)}
                                                title={t('edit')}
                                            >
                                                <Edit size={12} />
                                            </button>
                                            <button
                                                className="btn btn-icon btn-ghost btn-xs"
                                                onClick={() => handleDeleteClick(deal)}
                                                title={t('delete')}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            <span className={`${styles.priorityIndicator} ${priorityStyles[deal.priority]}`}>
                                                <Flag size={12} />
                                            </span>
                                        </div>
                                    </div>

                                    {deal.company && (
                                        <div className={styles.dealCardCompany}>
                                            <Building2 size={12} />
                                            <span>{deal.company.name}</span>
                                        </div>
                                    )}

                                    <div className={styles.dealCardValue}>{formatCurrency(deal.value)}</div>

                                    <div className={styles.dealCardFooter}>
                                        {deal.contact && (
                                            <div className={styles.dealContact}>
                                                <img
                                                    src={deal.contact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${deal.contact.email}`}
                                                    alt={deal.contact.firstName}
                                                    className="avatar avatar-sm"
                                                />
                                                <span>{deal.contact.firstName}</span>
                                            </div>
                                        )}
                                        {deal.expectedClose && (
                                            <div className={styles.dealDate}>
                                                <Calendar size={12} />
                                                <span>{formatDate(deal.expectedClose)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.probabilityBar}>
                                        <div
                                            className={styles.probabilityFill}
                                            style={{
                                                width: `${deal.probability}%`,
                                                background: stage.color,
                                            }}
                                        />
                                    </div>
                                    <span className={styles.probabilityLabel}>{deal.probability}% {t('probability')}</span>
                                </div>
                            ))}

                            {stage.deals.length === 0 && (
                                <div className={styles.emptyColumn}>
                                    <p>{t('noDealsInStage')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingDeal ? t('edit') + ' ' + t('deals') : t('addDeal')}
                size="lg"
            >
                <DealForm
                    deal={editingDeal || undefined}
                    companies={companies}
                    contacts={contacts}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => handleSuccess(!!editingDeal)}
                />
            </Modal>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, deal: null })}
                onConfirm={handleDeleteConfirm}
                title={t('delete') + ' ' + t('deals')}
                message={`Are you sure you want to delete "${deleteConfirm.deal?.title}"? This action cannot be undone.`}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                loading={isDeleting}
            />
        </>
    )
}
