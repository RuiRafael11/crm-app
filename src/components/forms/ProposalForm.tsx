'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import styles from './Forms.module.css'
import proposalStyles from '@/app/proposals/page.module.css'

interface ProposalItem {
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

interface Deal {
    id: string
    title: string
    value: number
}

interface ProposalFormProps {
    proposal?: {
        id: string
        title: string
        description: string | null
        status: string
        validUntil: string | null
        notes: string | null
        discount: number
        contactId: string | null
        dealId: string | null
        items: ProposalItem[]
    }
    contacts: Contact[]
    deals: Deal[]
    onClose: () => void
    onSuccess: () => void
}

const emptyItem: ProposalItem = {
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
}

// Default service items for web agency
const defaultItems: ProposalItem[] = [
    { description: 'Design e Desenvolvimento de Website', quantity: 1, unitPrice: 800, total: 800 },
    { description: 'Otimização SEO', quantity: 1, unitPrice: 200, total: 200 },
    { description: 'Integração com Redes Sociais', quantity: 1, unitPrice: 100, total: 100 },
]

export default function ProposalForm({
    proposal,
    contacts,
    deals,
    onClose,
    onSuccess,
}: ProposalFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: proposal?.title || 'Proposta de Criação de Website',
        description: proposal?.description || '',
        status: proposal?.status || 'draft',
        validUntil: proposal?.validUntil?.split('T')[0] || '',
        notes: proposal?.notes || '',
        discount: proposal?.discount || 0,
        contactId: proposal?.contactId || '',
        dealId: proposal?.dealId || '',
    })
    const [items, setItems] = useState<ProposalItem[]>(
        proposal?.items.length ? proposal.items : defaultItems
    )

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const total = subtotal - formData.discount

    const updateItem = (index: number, field: keyof ProposalItem, value: string | number) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (items.length === 0) return
        setLoading(true)

        try {
            const url = proposal ? `/api/proposals/${proposal.id}` : '/api/proposals'
            const method = proposal ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
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
            console.error('Error saving proposal:', error)
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
                {proposal && (
                    <div className={styles.field}>
                        <label className={styles.label}>Estado</label>
                        <select
                            className="form-input"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="draft">Rascunho</option>
                            <option value="sent">Enviada</option>
                            <option value="accepted">Aceite</option>
                            <option value="rejected">Recusada</option>
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
                    <label className={styles.label}>Válido até</label>
                    <input
                        type="date"
                        className="form-input"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    />
                </div>
            </div>

            {/* Items */}
            <div className={styles.field}>
                <label className={styles.label}>Itens / Serviços</label>
                <div className={proposalStyles.itemsList}>
                    {items.map((item, index) => (
                        <div key={index} className={proposalStyles.itemRow}>
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
                            <span className={proposalStyles.itemTotal}>
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
            <div className={proposalStyles.totalsSection}>
                <div className={proposalStyles.totalsRow}>
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className={proposalStyles.totalsRow}>
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
                <div className={`${proposalStyles.totalsRow} ${proposalStyles.totalsFinal}`}>
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
                    rows={3}
                    placeholder="Termos e condições, observações..."
                />
            </div>

            <div className={styles.actions}>
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || items.length === 0}>
                    {loading ? 'A guardar...' : proposal ? 'Atualizar' : 'Criar Proposta'}
                </button>
            </div>
        </form>
    )
}
