'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    FileText,
    User,
    Calendar,
    Edit,
    Trash2,
    Plus,
    Send,
    Download,
} from 'lucide-react'
import Header from '@/components/Header'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import ProposalForm from '@/components/forms/ProposalForm'
import styles from '@/app/proposals/page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/components/Toast'

interface ProposalItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
}

interface Proposal {
    id: string
    number: string
    title: string
    description: string | null
    status: string
    validUntil: string | null
    notes: string | null
    subtotal: number
    discount: number
    total: number
    contactId: string | null
    dealId: string | null
    contact: { firstName: string; lastName: string; email: string } | null
    deal: { title: string } | null
    items: ProposalItem[]
    createdAt: string
}

interface Contact {
    id: string
    firstName: string
    lastName: string
    email: string
    companyName: string | null
}

interface Deal {
    id: string
    title: string
    value: number
}

interface ProposalsViewProps {
    data: {
        proposals: Proposal[]
        contacts: Contact[]
        deals: Deal[]
    }
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
    }).format(value)
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export default function ProposalsView({ data }: ProposalsViewProps) {
    const { t } = useLanguage()
    const { showToast } = useToast()
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProposal, setEditingProposal] = useState<Proposal | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; proposal: Proposal | null }>({
        isOpen: false,
        proposal: null,
    })
    const [isDeleting, setIsDeleting] = useState(false)

    const handleAdd = () => {
        setEditingProposal(null)
        setIsModalOpen(true)
    }

    const handleEdit = (proposal: Proposal) => {
        setEditingProposal(proposal)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (proposal: Proposal) => {
        setDeleteConfirm({ isOpen: true, proposal })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.proposal) return
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/proposals/${deleteConfirm.proposal.id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                showToast('Proposta eliminada', 'success')
                router.refresh()
            } else {
                showToast(t('errorOccurred'), 'error')
            }
        } catch {
            showToast(t('errorOccurred'), 'error')
        } finally {
            setIsDeleting(false)
            setDeleteConfirm({ isOpen: false, proposal: null })
        }
    }

    const handleSuccess = (isEdit: boolean) => {
        setIsModalOpen(false)
        setEditingProposal(null)
        showToast(isEdit ? 'Proposta atualizada' : 'Proposta criada', 'success')
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'draft': return styles.statusDraft
            case 'sent': return styles.statusSent
            case 'accepted': return styles.statusAccepted
            case 'rejected': return styles.statusRejected
            default: return styles.statusDraft
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Rascunho'
            case 'sent': return 'Enviada'
            case 'accepted': return 'Aceite'
            case 'rejected': return 'Recusada'
            default: return status
        }
    }

    // Stats
    const totalValue = data.proposals
        .filter((p) => p.status === 'accepted')
        .reduce((sum, p) => sum + p.total, 0)
    const pending = data.proposals.filter((p) => p.status === 'sent').length
    const accepted = data.proposals.filter((p) => p.status === 'accepted').length

    return (
        <>
            <Header
                title="Propostas"
                subtitle={`${data.proposals.length} propostas • ${formatCurrency(totalValue)} aceites`}
                showAddButton
                addButtonLabel="Nova Proposta"
                onAddClick={handleAdd}
            />

            {/* Quick Stats */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Propostas</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{data.proposals.length}</div>
                </div>
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pendentes</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--info)' }}>{pending}</div>
                </div>
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Aceites</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{accepted}</div>
                </div>
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Valor Aceite</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{formatCurrency(totalValue)}</div>
                </div>
            </div>

            {/* Proposals Grid */}
            <div className={styles.proposalsGrid}>
                {data.proposals.map((proposal) => (
                    <div key={proposal.id} className={styles.proposalCard}>
                        <div className={styles.proposalHeader}>
                            <div>
                                <div className={styles.proposalNumber}>{proposal.number}</div>
                                <div className={styles.proposalTitle}>{proposal.title}</div>
                                {proposal.contact && (
                                    <div className={styles.proposalClient}>
                                        <User size={14} />
                                        {proposal.contact.firstName} {proposal.contact.lastName}
                                    </div>
                                )}
                            </div>
                            <span className={`${styles.statusBadge} ${getStatusClass(proposal.status)}`}>
                                {getStatusLabel(proposal.status)}
                            </span>
                        </div>

                        <div className={styles.proposalTotal}>
                            {formatCurrency(proposal.total)}
                        </div>

                        <div className={styles.proposalMeta}>
                            <div className={styles.proposalMetaItem}>
                                <FileText size={14} />
                                {proposal.items.length} itens
                            </div>
                            {proposal.validUntil && (
                                <div className={styles.proposalMetaItem}>
                                    <Calendar size={14} />
                                    Válido até {formatDate(proposal.validUntil)}
                                </div>
                            )}
                        </div>

                        <div className={styles.proposalActions}>
                            <a
                                href={`/api/proposals/${proposal.id}/pdf`}
                                className="btn btn-ghost btn-sm"
                                download
                            >
                                <Download size={14} /> PDF
                            </a>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(proposal)}>
                                <Edit size={14} /> Editar
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteClick(proposal)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {data.proposals.length === 0 && (
                    <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>
                        <FileText size={48} className={styles.emptyStateIcon} />
                        <p>Nenhuma proposta criada</p>
                        <button className="btn btn-primary mt-md" onClick={handleAdd}>
                            <Plus size={16} /> Criar Proposta
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProposal ? 'Editar Proposta' : 'Nova Proposta'}
            >
                <ProposalForm
                    proposal={editingProposal || undefined}
                    contacts={data.contacts}
                    deals={data.deals}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => handleSuccess(!!editingProposal)}
                />
            </Modal>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, proposal: null })}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Proposta"
                message={`Tem a certeza que deseja eliminar a proposta "${deleteConfirm.proposal?.number}"?`}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                loading={isDeleting}
            />
        </>
    )
}
