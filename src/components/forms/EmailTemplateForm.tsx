'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Forms.module.css'

interface EmailTemplateFormProps {
    template?: {
        id: string
        name: string
        subject: string
        body: string
        type: string
    }
    onClose: () => void
    onSuccess: () => void
}

const templateTypes = [
    { value: 'proposal', label: 'Proposta' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'welcome', label: 'Boas-vindas' },
    { value: 'custom', label: 'Personalizado' },
]

const defaultTemplates: Record<string, { subject: string; body: string }> = {
    proposal: {
        subject: 'Proposta de Criação de Website - {{companyName}}',
        body: `<h2>Olá {{firstName}},</h2>
<p>Espero que este email o encontre bem!</p>
<p>Conforme conversamos, segue a nossa proposta para a criação do website da <strong>{{companyName}}</strong>.</p>
<h3>O que incluímos:</h3>
<ul>
  <li>Design moderno e responsivo</li>
  <li>Otimização SEO</li>
  <li>Integração com redes sociais</li>
  <li>Formulário de contacto</li>
</ul>
<p>Valor do investimento: <strong>€{{value}}</strong></p>
<p>Ficamos ao dispor para qualquer questão!</p>
<p>Cumprimentos,<br>A equipa</p>`,
    },
    'follow-up': {
        subject: 'Acompanhamento - Proposta de Website',
        body: `<h2>Olá {{firstName}},</h2>
<p>Espero que esteja tudo bem consigo!</p>
<p>Estou a contactá-lo para saber se teve oportunidade de analisar a nossa proposta.</p>
<p>Teria alguma dúvida ou gostaria de agendar uma reunião para discutir os detalhes?</p>
<p>Aguardo o seu feedback.</p>
<p>Cumprimentos,<br>A equipa</p>`,
    },
    welcome: {
        subject: 'Bem-vindo! Início do Projeto - {{companyName}}',
        body: `<h2>Olá {{firstName}},</h2>
<p>Bem-vindo à nossa família de clientes!</p>
<p>É com grande entusiasmo que iniciamos o desenvolvimento do website da <strong>{{companyName}}</strong>.</p>
<h3>Próximos passos:</h3>
<ol>
  <li>Reunião de kickoff para definir detalhes</li>
  <li>Envio de materiais (logo, fotos, textos)</li>
  <li>Primeira versão do design em 5 dias úteis</li>
</ol>
<p>Qualquer dúvida, estamos à disposição!</p>
<p>Cumprimentos,<br>A equipa</p>`,
    },
}

export default function EmailTemplateForm({ template, onClose, onSuccess }: EmailTemplateFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: template?.name || '',
        subject: template?.subject || '',
        body: template?.body || '',
        type: template?.type || 'custom',
    })

    const handleTypeChange = (type: string) => {
        setFormData((prev) => ({
            ...prev,
            type,
            subject: defaultTemplates[type]?.subject || prev.subject,
            body: defaultTemplates[type]?.body || prev.body,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = template ? `/api/emails/templates/${template.id}` : '/api/emails/templates'
            const method = template ? 'PUT' : 'POST'

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
            console.error('Error saving template:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Nome do Template *</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Proposta Inicial"
                        required
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Tipo</label>
                    <select
                        className="form-input"
                        value={formData.type}
                        onChange={(e) => handleTypeChange(e.target.value)}
                    >
                        {templateTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Assunto *</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Ex: Proposta de Criação de Website"
                    required
                />
                <small className="text-muted">Use {'{{firstName}}'}, {'{{companyName}}'}, {'{{value}}'} para variáveis</small>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Corpo do Email (HTML) *</label>
                <textarea
                    className="form-input"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={10}
                    placeholder="<h2>Olá {{firstName}},</h2><p>...</p>"
                    required
                />
            </div>

            <div className={styles.actions}>
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'A guardar...' : template ? 'Atualizar' : 'Criar Template'}
                </button>
            </div>
        </form>
    )
}
