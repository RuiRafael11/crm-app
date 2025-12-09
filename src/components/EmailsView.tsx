'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Mail,
    Send,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    Edit,
    Trash2,
} from 'lucide-react'
import Header from '@/components/Header'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import EmailTemplateForm from '@/components/forms/EmailTemplateForm'
import SendEmailForm from '@/components/forms/SendEmailForm'
import styles from '@/app/emails/page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/components/Toast'

interface EmailTemplate {
    id: string
    name: string
    subject: string
    body: string
    type: string
    createdAt: string
}

interface Contact {
    id: string
    firstName: string
    lastName: string
    email: string
    companyName: string | null
}

interface EmailLog {
    id: string
    to: string
    subject: string
    body: string
    status: string
    sentAt: string
    contact: { firstName: string; lastName: string; email: string } | null
    template: { name: string } | null
}

interface EmailsViewProps {
    data: {
        templates: EmailTemplate[]
        logs: EmailLog[]
        contacts: Contact[]
    }
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins} min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays === 1) return 'Ontem'
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
}

export default function EmailsView({ data }: EmailsViewProps) {
    const { t } = useLanguage()
    const { showToast } = useToast()
    const router = useRouter()
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
    const [isSendModalOpen, setIsSendModalOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; template: EmailTemplate | null }>({
        isOpen: false,
        template: null,
    })
    const [isDeleting, setIsDeleting] = useState(false)

    const handleAddTemplate = () => {
        setEditingTemplate(null)
        setIsTemplateModalOpen(true)
    }

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate(template)
        setIsTemplateModalOpen(true)
    }

    const handleDeleteClick = (template: EmailTemplate) => {
        setDeleteConfirm({ isOpen: true, template })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.template) return
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/emails/templates/${deleteConfirm.template.id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                showToast('Template eliminado', 'success')
                router.refresh()
            } else {
                showToast(t('errorOccurred'), 'error')
            }
        } catch {
            showToast(t('errorOccurred'), 'error')
        } finally {
            setIsDeleting(false)
            setDeleteConfirm({ isOpen: false, template: null })
        }
    }

    const handleTemplateSuccess = (isEdit: boolean) => {
        setIsTemplateModalOpen(false)
        setEditingTemplate(null)
        showToast(isEdit ? 'Template atualizado' : 'Template criado', 'success')
    }

    const handleSendSuccess = () => {
        setIsSendModalOpen(false)
        showToast('Email enviado com sucesso!', 'success')
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'proposal': return 'Proposta'
            case 'follow-up': return 'Follow-up'
            case 'welcome': return 'Boas-vindas'
            default: return 'Personalizado'
        }
    }

    return (
        <>
            <Header
                title="Emails"
                subtitle={`${data.templates.length} templates • ${data.logs.length} enviados`}
                showSearch={false}
            />

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <button className="btn btn-primary" onClick={() => setIsSendModalOpen(true)}>
                    <Send size={18} /> Enviar Email
                </button>
                <button className="btn btn-ghost" onClick={handleAddTemplate}>
                    <Plus size={18} /> Novo Template
                </button>
            </div>

            <div className={styles.emailsGrid}>
                {/* Templates Section */}
                <div className={`card ${styles.templatesSection}`}>
                    <div className="card-header">
                        <h3 className="card-title">
                            <FileText size={18} /> Templates
                        </h3>
                    </div>

                    <div className={styles.templatesList}>
                        {data.templates.map((template) => (
                            <div key={template.id} className={styles.templateCard}>
                                <div className={styles.templateCardHeader}>
                                    <span className={styles.templateName}>{template.name}</span>
                                    <span className={styles.templateType}>{getTypeLabel(template.type)}</span>
                                </div>
                                <div className={styles.templateSubject}>{template.subject}</div>
                                <div className={styles.templateActions}>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => handleEdit(template)}
                                    >
                                        <Edit size={14} /> Editar
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => handleDeleteClick(template)}
                                    >
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}

                        {data.templates.length === 0 && (
                            <div className={styles.emptyState}>
                                <FileText size={48} className={styles.emptyStateIcon} />
                                <p>Nenhum template criado</p>
                                <button className="btn btn-primary mt-md" onClick={handleAddTemplate}>
                                    <Plus size={16} /> Criar Template
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Logs Section */}
                <div className={`card ${styles.logsSection}`}>
                    <div className="card-header">
                        <h3 className="card-title">
                            <Send size={18} /> Histórico de Envios
                        </h3>
                    </div>

                    <div className={styles.logsList}>
                        {data.logs.map((log) => (
                            <div key={log.id} className={styles.logItem}>
                                <div className={`${styles.logIcon} ${log.status === 'sent' ? styles.logIconSent : styles.logIconFailed}`}>
                                    {log.status === 'sent' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                </div>
                                <div className={styles.logContent}>
                                    <div className={styles.logTo}>
                                        {log.contact
                                            ? `${log.contact.firstName} ${log.contact.lastName}`
                                            : log.to}
                                    </div>
                                    <div className={styles.logSubject}>{log.subject}</div>
                                </div>
                                <div className={styles.logTime}>
                                    <Clock size={12} /> {formatDate(log.sentAt)}
                                </div>
                            </div>
                        ))}

                        {data.logs.length === 0 && (
                            <div className={styles.emptyState}>
                                <Mail size={48} className={styles.emptyStateIcon} />
                                <p>Nenhum email enviado</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Template Modal */}
            <Modal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                title={editingTemplate ? 'Editar Template' : 'Novo Template'}
            >
                <EmailTemplateForm
                    template={editingTemplate || undefined}
                    onClose={() => setIsTemplateModalOpen(false)}
                    onSuccess={() => handleTemplateSuccess(!!editingTemplate)}
                />
            </Modal>

            {/* Send Email Modal */}
            <Modal
                isOpen={isSendModalOpen}
                onClose={() => setIsSendModalOpen(false)}
                title="Enviar Email"
            >
                <SendEmailForm
                    contacts={data.contacts}
                    templates={data.templates}
                    onClose={() => setIsSendModalOpen(false)}
                    onSuccess={handleSendSuccess}
                />
            </Modal>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, template: null })}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Template"
                message={`Tem a certeza que deseja eliminar "${deleteConfirm.template?.name}"?`}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                loading={isDeleting}
            />
        </>
    )
}
