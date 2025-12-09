'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Receipt,
    User,
    Calendar,
    Edit,
    Trash2,
    Plus,
    CheckCircle,
    Clock,
    Download,
} from 'lucide-react'
import Header from '@/components/Header'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import InvoiceForm from '@/components/forms/InvoiceForm'
import styles from '@/app/invoices/page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/components/Toast'

interface InvoiceItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
}

interface Invoice {
    id: string
    number: string
    title: string
    status: string
    issueDate: string
    dueDate: string | null
    paidDate: string | null
    notes: string | null
    subtotal: number
    tax: number
    taxRate: number
    discount: number
    total: number
    contactId: string | null
    proposalId: string | null
    contact: { firstName: string; lastName: string; email: string } | null
    proposal: { number: string; title: string } | null
    items: InvoiceItem[]
    createdAt: string
}

interface Contact {
    id: string
    firstName: string
    lastName: string
    email: string
    companyName: string | null
}

interface Proposal {
    id: string
    number: string
    title: string
    total: number
}

interface InvoicesViewProps {
    data: {
        invoices: Invoice[]
        contacts: Contact[]
        proposals: Proposal[]
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

export default function InvoicesView({ data }: InvoicesViewProps) {
    const { t } = useLanguage()
    const { showToast } = useToast()
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; invoice: Invoice | null }>({
        isOpen: false,
        invoice: null,
    })
    const [isDeleting, setIsDeleting] = useState(false)

    const handleAdd = () => {
        setEditingInvoice(null)
        setIsModalOpen(true)
    }

    const handleEdit = (invoice: Invoice) => {
        setEditingInvoice(invoice)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (invoice: Invoice) => {
        setDeleteConfirm({ isOpen: true, invoice })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.invoice) return
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/invoices/${deleteConfirm.invoice.id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                showToast('Fatura eliminada', 'success')
                router.refresh()
            } else {
                showToast(t('errorOccurred'), 'error')
            }
        } catch {
            showToast(t('errorOccurred'), 'error')
        } finally {
            setIsDeleting(false)
            setDeleteConfirm({ isOpen: false, invoice: null })
        }
    }

    const handleMarkAsPaid = async (invoice: Invoice) => {
        try {
            const response = await fetch(`/api/invoices/${invoice.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...invoice,
                    status: 'paid',
                    items: invoice.items,
                }),
            })
            if (response.ok) {
                showToast('Fatura marcada como paga!', 'success')
                router.refresh()
            }
        } catch {
            showToast(t('errorOccurred'), 'error')
        }
    }

    const handleSuccess = (isEdit: boolean) => {
        setIsModalOpen(false)
        setEditingInvoice(null)
        showToast(isEdit ? 'Fatura atualizada' : 'Fatura criada', 'success')
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'draft': return styles.statusDraft
            case 'sent': return styles.statusSent
            case 'paid': return styles.statusPaid
            case 'overdue': return styles.statusOverdue
            case 'cancelled': return styles.statusCancelled
            default: return styles.statusDraft
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Rascunho'
            case 'sent': return 'Enviada'
            case 'paid': return 'Paga'
            case 'overdue': return 'Vencida'
            case 'cancelled': return 'Cancelada'
            default: return status
        }
    }

    // Stats
    const totalRevenue = data.invoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0)
    const pending = data.invoices.filter((inv) => inv.status === 'sent').length
    const pendingValue = data.invoices
        .filter((inv) => inv.status === 'sent')
        .reduce((sum, inv) => sum + inv.total, 0)
    const paid = data.invoices.filter((inv) => inv.status === 'paid').length

    return (
        <>
            <Header
                title="Faturas"
                subtitle={`${data.invoices.length} faturas • ${formatCurrency(totalRevenue)} recebido`}
                showAddButton
                addButtonLabel="Nova Fatura"
                onAddClick={handleAdd}
            />

            {/* Stats */}
            <div className={styles.statsGrid}>
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Faturas</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{data.invoices.length}</div>
                </div>
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pendentes</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>{pending}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{formatCurrency(pendingValue)}</div>
                </div>
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pagas</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{paid}</div>
                </div>
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Receita Total</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{formatCurrency(totalRevenue)}</div>
                </div>
            </div>

            {/* Invoices Grid */}
            <div className={styles.invoicesGrid}>
                {data.invoices.map((invoice) => (
                    <div key={invoice.id} className={styles.invoiceCard}>
                        <div className={styles.invoiceHeader}>
                            <div>
                                <div className={styles.invoiceNumber}>{invoice.number}</div>
                                <div className={styles.invoiceTitle}>{invoice.title}</div>
                                {invoice.contact && (
                                    <div className={styles.invoiceClient}>
                                        <User size={14} />
                                        {invoice.contact.firstName} {invoice.contact.lastName}
                                    </div>
                                )}
                            </div>
                            <span className={`${styles.statusBadge} ${getStatusClass(invoice.status)}`}>
                                {getStatusLabel(invoice.status)}
                            </span>
                        </div>

                        <div className={styles.invoiceTotal}>
                            {formatCurrency(invoice.total)}
                        </div>

                        <div className={styles.invoiceMeta}>
                            <div className={styles.invoiceMetaItem}>
                                <Receipt size={14} />
                                {invoice.items.length} itens
                            </div>
                            {invoice.dueDate && (
                                <div className={styles.invoiceMetaItem}>
                                    <Calendar size={14} />
                                    Vence {formatDate(invoice.dueDate)}
                                </div>
                            )}
                        </div>

                        <div className={styles.invoiceActions}>
                            <a
                                href={`/api/invoices/${invoice.id}/pdf`}
                                className="btn btn-ghost btn-sm"
                                download
                            >
                                <Download size={14} /> PDF
                            </a>
                            {invoice.status === 'sent' && (
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => handleMarkAsPaid(invoice)}
                                >
                                    <CheckCircle size={14} /> Paga
                                </button>
                            )}
                            <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(invoice)}>
                                <Edit size={14} />
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteClick(invoice)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {data.invoices.length === 0 && (
                    <div className={styles.emptyState}>
                        <Receipt size={48} className={styles.emptyStateIcon} />
                        <p>Nenhuma fatura criada</p>
                        <button className="btn btn-primary mt-md" onClick={handleAdd}>
                            <Plus size={16} /> Criar Fatura
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingInvoice ? 'Editar Fatura' : 'Nova Fatura'}
            >
                <InvoiceForm
                    invoice={editingInvoice || undefined}
                    contacts={data.contacts}
                    proposals={data.proposals}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => handleSuccess(!!editingInvoice)}
                />
            </Modal>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, invoice: null })}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Fatura"
                message={`Tem a certeza que deseja eliminar a fatura "${deleteConfirm.invoice?.number}"?`}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                loading={isDeleting}
            />
        </>
    )
}
