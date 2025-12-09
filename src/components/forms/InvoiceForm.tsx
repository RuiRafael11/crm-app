'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import styles from './Forms.module.css'
import invoiceStyles from '@/app/invoices/page.module.css'

interface InvoiceItem {
    id?: string
    description: string
    quantity: number
    unitPrice: number
    total: number
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

interface InvoiceFormProps {
    invoice?: {
        id: string
        title: string
        status: string
        dueDate: string | null
        notes: string | null
        taxRate: number
        discount: number
        contactId: string | null
        proposalId: string | null
        items: InvoiceItem[]
    }
    contacts: Contact[]
    proposals: Proposal[]
    onClose: () => void
    onSuccess: () => void
}

const emptyItem: InvoiceItem = {
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
}

export default function InvoiceForm({
    invoice,
    contacts,
    proposals,
    onClose,
    onSuccess,
}: InvoiceFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: invoice?.title || 'Fatura de Serviços',
        status: invoice?.status || 'draft',
        dueDate: invoice?.dueDate?.split('T')[0] || '',
        notes: invoice?.notes || '',
        taxRate: invoice?.taxRate || 23,
        discount: invoice?.discount || 0,
        contactId: invoice?.contactId || '',
        proposalId: invoice?.proposalId || '',
    })
    const [items, setItems] = useState<InvoiceItem[]>(
        invoice?.items.length ? invoice.items : [{ ...emptyItem }]
    )

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const tax = subtotal * (formData.taxRate / 100)
    const total = subtotal + tax - formData.discount

    const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items]
        newItems[index] = {
            ...newItems[index],
            [field]: value,
            total: field === 'quantity' || field === 'unitPrice'
                ? (field === 'quantity' ? Number(value) : newItems[index].quantity) *
                (field === 'unitPrice' ? Number(value) : newItems[index].unitPrice)
                : newItems[index].total,
        }
        setItems(newItems)
    }

    const addItem = () => {
        setItems([...items, { ...emptyItem }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    // Import from proposal - fetches full proposal data with items
    const handleImportFromProposal = async (proposalId: string) => {
        if (!proposalId) {
            setFormData({ ...formData, proposalId: '' })
            return
        }

        try {
            const response = await fetch(`/api/proposals/${proposalId}`)
            if (!response.ok) return

            const proposal = await response.json()

            // Update form with proposal data
            setFormData({
                ...formData,
                proposalId,
                title: `Fatura - ${proposal.title}`,
                contactId: proposal.contactId?.toString() || formData.contactId,
                taxRate: proposal.taxRate || 23,
                discount: proposal.discount || 0,
            })

            // Import items from proposal
            if (proposal.items && proposal.items.length > 0) {
                setItems(proposal.items.map((item: any) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.quantity * item.unitPrice,
                })))
            }
        } catch (error) {
            console.error('Error importing proposal:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (items.length === 0) return
        setLoading(true)

        try {
            const url = invoice ? `/api/invoices/${invoice.id}` : '/api/invoices'
            const method = invoice ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    taxRate: Number(formData.taxRate),
                    discount: Number(formData.discount),
                    items: items.map((item) => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                    })),
                }),
            })

            if (response.ok) {
                onSuccess()
                router.refresh()
            }
        } catch (error) {
            console.error('Error saving invoice:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Título *</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>
                {invoice && (
                    <div className={styles.field}>
                        <label className={styles.label}>Estado</label>
                        <select
                            className="form-input"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="draft">Rascunho</option>
                            <option value="sent">Enviada</option>
                            <option value="paid">Paga</option>
                            <option value="overdue">Vencida</option>
                            <option value="cancelled">Cancelada</option>
                        </select>
                    </div>
                )}
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Cliente</label>
                    <select
                        className="form-input"
                        value={formData.contactId}
                        onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                    >
                        <option value="">Selecionar cliente...</option>
                        {contacts.map((contact) => (
                            <option key={contact.id} value={contact.id}>
                                {contact.firstName} {contact.lastName}
                                {contact.companyName && ` (${contact.companyName})`}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Data de Vencimento</label>
                    <input
                        type="date"
                        className="form-input"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                </div>
            </div>

            {proposals.length > 0 && !invoice && (
                <div className={styles.field}>
                    <label className={styles.label}>Importar de Proposta (opcional)</label>
                    <select
                        className="form-input"
                        value={formData.proposalId}
                        onChange={(e) => handleImportFromProposal(e.target.value)}
                    >
                        <option value="">Sem proposta</option>
                        {proposals.map((proposal) => (
                            <option key={proposal.id} value={proposal.id}>
                                {proposal.number} - {proposal.title} ({formatCurrency(proposal.total)})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Items */}
            <div className={styles.field}>
                <label className={styles.label}>Itens / Serviços</label>
                <div className={invoiceStyles.itemsList}>
                    {items.map((item, index) => (
                        <div key={index} className={invoiceStyles.itemRow}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Descrição"
                                value={item.description}
                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                required
                            />
                            <input
                                type="number"
                                className="form-input"
                                placeholder="Qtd"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                required
                            />
                            <input
                                type="number"
                                className="form-input"
                                placeholder="Preço"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                required
                            />
                            <span className={invoiceStyles.itemTotal}>
                                {formatCurrency(item.quantity * item.unitPrice)}
                            </span>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => removeItem(index)}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
                    <Plus size={14} /> Adicionar Item
                </button>
            </div>

            {/* Totals */}
            <div className={invoiceStyles.totalsSection}>
                <div className={invoiceStyles.totalsRow}>
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className={invoiceStyles.totalsRow}>
                    <span>IVA (%):</span>
                    <input
                        type="number"
                        className="form-input"
                        style={{ width: '80px' }}
                        min="0"
                        max="100"
                        value={formData.taxRate}
                        onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                    />
                    <span>{formatCurrency(tax)}</span>
                </div>
                <div className={invoiceStyles.totalsRow}>
                    <span>Desconto (€):</span>
                    <input
                        type="number"
                        className="form-input"
                        style={{ width: '120px' }}
                        min="0"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    />
                </div>
                <div className={`${invoiceStyles.totalsRow} ${invoiceStyles.totalsFinal}`}>
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Notas</label>
                <textarea
                    className="form-input"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    placeholder="Condições de pagamento, observações..."
                />
            </div>

            <div className={styles.actions}>
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || items.length === 0}>
                    {loading ? 'A guardar...' : invoice ? 'Atualizar' : 'Criar Fatura'}
                </button>
            </div>
        </form>
    )
}
