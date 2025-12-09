'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import {
    User, Bell, Shield, Palette, Database, HelpCircle, Languages, Lock, Save,
    Download, Upload, Moon, Sun, ChevronLeft, Mail, Phone, Keyboard
} from 'lucide-react'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/components/Toast'

type SettingsSection = 'main' | 'profile' | 'notifications' | 'security' | 'appearance' | 'dataExport' | 'helpSupport'

export default function SettingsPage() {
    const { language, setLanguage, t } = useLanguage()
    const { showToast } = useToast()
    const router = useRouter()
    const [activeSection, setActiveSection] = useState<SettingsSection>('main')

    // Profile state
    const [profileName, setProfileName] = useState('')
    const [profileEmail, setProfileEmail] = useState('')
    const [profilePhone, setProfilePhone] = useState('')

    // Notifications state
    const [emailNotifs, setEmailNotifs] = useState(true)
    const [taskReminders, setTaskReminders] = useState(true)
    const [dealUpdates, setDealUpdates] = useState(true)

    // Appearance state
    const [darkMode, setDarkMode] = useState(true)

    // Load saved data
    useEffect(() => {
        const savedProfile = localStorage.getItem('crm_profile')
        if (savedProfile) {
            const profile = JSON.parse(savedProfile)
            setProfileName(profile.name || '')
            setProfileEmail(profile.email || '')
            setProfilePhone(profile.phone || '')
        }

        const savedNotifs = localStorage.getItem('crm_notifications')
        if (savedNotifs) {
            const notifs = JSON.parse(savedNotifs)
            setEmailNotifs(notifs.email ?? true)
            setTaskReminders(notifs.tasks ?? true)
            setDealUpdates(notifs.deals ?? true)
        }
    }, [])

    const handleSaveProfile = () => {
        localStorage.setItem('crm_profile', JSON.stringify({
            name: profileName,
            email: profileEmail,
            phone: profilePhone,
        }))
        showToast('Perfil guardado!', 'success')
    }

    const handleSaveNotifications = () => {
        localStorage.setItem('crm_notifications', JSON.stringify({
            email: emailNotifs,
            tasks: taskReminders,
            deals: dealUpdates,
        }))
        showToast('Preferências guardadas!', 'success')
    }

    const handleExportContacts = async () => {
        try {
            const response = await fetch('/api/contacts')
            const contacts = await response.json()
            const csv = [
                'Nome,Apelido,Email,Telefone,Empresa',
                ...contacts.map((c: any) => `${c.firstName},${c.lastName},${c.email},${c.phone || ''},${c.company?.name || ''}`)
            ].join('\n')

            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'contactos.csv'
            a.click()
            showToast('Contactos exportados!', 'success')
        } catch {
            showToast('Erro ao exportar', 'error')
        }
    }

    const handleExportInvoices = async () => {
        try {
            const response = await fetch('/api/invoices')
            const invoices = await response.json()
            const csv = [
                'Número,Título,Estado,Cliente,Total,Data',
                ...invoices.map((i: any) => `${i.number},${i.title},${i.status},${i.contact?.firstName || ''} ${i.contact?.lastName || ''},${i.total},${i.issueDate}`)
            ].join('\n')

            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'faturas.csv'
            a.click()
            showToast('Faturas exportadas!', 'success')
        } catch {
            showToast('Erro ao exportar', 'error')
        }
    }

    const renderMainMenu = () => (
        <>
            <div className={`${styles.settingsCard} card mb-lg`} style={{ cursor: 'default' }}>
                <div className={styles.settingsIcon} style={{ background: 'rgba(236, 72, 153, 0.15)' }}>
                    <Languages size={24} style={{ color: '#ec4899' }} />
                </div>
                <div className={styles.settingsContent}>
                    <h3 className={styles.settingsTitle}>{t('language')}</h3>
                    <p className={styles.settingsDescription}>{t('languageDesc')}</p>
                </div>
                <div className={styles.languageButtons}>
                    <button
                        className={`btn ${language === 'en' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setLanguage('en')}
                    >
                        English
                    </button>
                    <button
                        className={`btn ${language === 'pt' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setLanguage('pt')}
                    >
                        Português (PT)
                    </button>
                </div>
            </div>

            <div className={styles.settingsGrid}>
                {[
                    { id: 'profile', title: t('profile'), description: 'Gerir informações pessoais', icon: User, color: 'rgba(139, 92, 246, 0.15)', iconColor: '#a78bfa' },
                    { id: 'notifications', title: t('notifications'), description: 'Configurar notificações', icon: Bell, color: 'rgba(59, 130, 246, 0.15)', iconColor: '#3b82f6' },
                    { id: 'security', title: t('security'), description: 'Password e autenticação', icon: Shield, color: 'rgba(34, 197, 94, 0.15)', iconColor: '#22c55e' },
                    { id: 'appearance', title: t('appearance'), description: 'Personalizar aparência', icon: Palette, color: 'rgba(245, 158, 11, 0.15)', iconColor: '#f59e0b' },
                    { id: 'dataExport', title: t('dataExport'), description: 'Exportar ou importar dados', icon: Database, color: 'rgba(239, 68, 68, 0.15)', iconColor: '#ef4444' },
                    { id: 'helpSupport', title: t('helpSupport'), description: 'Ajuda e documentação', icon: HelpCircle, color: 'rgba(113, 113, 122, 0.15)', iconColor: '#71717a' },
                ].map((section, index) => {
                    const Icon = section.icon
                    return (
                        <div
                            key={section.id}
                            className={`${styles.settingsCard} card fade-in stagger-${(index % 6) + 1}`}
                            onClick={() => setActiveSection(section.id as SettingsSection)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={styles.settingsIcon} style={{ background: section.color }}>
                                <Icon size={24} style={{ color: section.iconColor }} />
                            </div>
                            <div className={styles.settingsContent}>
                                <h3 className={styles.settingsTitle}>{section.title}</h3>
                                <p className={styles.settingsDescription}>{section.description}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )

    const renderProfile = () => (
        <div className="card">
            <div className="card-header">
                <button className="btn btn-ghost" onClick={() => setActiveSection('main')}>
                    <ChevronLeft size={18} /> Voltar
                </button>
                <h3 className="card-title">Perfil</h3>
            </div>
            <div style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div className="form-group">
                    <label className="form-label">Nome</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <User size={18} style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-input"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="O seu nome"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <Mail size={18} style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="email"
                            className="form-input"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            placeholder="email@exemplo.com"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Telefone</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <Phone size={18} style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="tel"
                            className="form-input"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            placeholder="+351 912 345 678"
                        />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={handleSaveProfile}>
                    <Save size={18} /> Guardar
                </button>
            </div>
        </div>
    )

    const renderNotifications = () => (
        <div className="card">
            <div className="card-header">
                <button className="btn btn-ghost" onClick={() => setActiveSection('main')}>
                    <ChevronLeft size={18} /> Voltar
                </button>
                <h3 className="card-title">Notificações</h3>
            </div>
            <div style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <label className={styles.toggleItem}>
                    <div>
                        <strong>Notificações por email</strong>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Receber emails sobre atividades</p>
                    </div>
                    <input type="checkbox" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />
                </label>
                <label className={styles.toggleItem}>
                    <div>
                        <strong>Lembretes de tarefas</strong>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Alertas para tarefas pendentes</p>
                    </div>
                    <input type="checkbox" checked={taskReminders} onChange={(e) => setTaskReminders(e.target.checked)} />
                </label>
                <label className={styles.toggleItem}>
                    <div>
                        <strong>Atualizações de negócios</strong>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Notificações de mudanças em negócios</p>
                    </div>
                    <input type="checkbox" checked={dealUpdates} onChange={(e) => setDealUpdates(e.target.checked)} />
                </label>
                <button className="btn btn-primary" onClick={handleSaveNotifications}>
                    <Save size={18} /> Guardar
                </button>
            </div>
        </div>
    )

    const renderSecurity = () => (
        <div className="card">
            <div className="card-header">
                <button className="btn btn-ghost" onClick={() => setActiveSection('main')}>
                    <ChevronLeft size={18} /> Voltar
                </button>
                <h3 className="card-title">Segurança</h3>
            </div>
            <div style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div className="form-group">
                    <label className="form-label">Password atual</label>
                    <input type="password" className="form-input" placeholder="••••••••" disabled />
                </div>
                <div className="form-group">
                    <label className="form-label">Nova password</label>
                    <input type="password" className="form-input" placeholder="••••••••" disabled />
                </div>
                <div className="form-group">
                    <label className="form-label">Confirmar password</label>
                    <input type="password" className="form-input" placeholder="••••••••" disabled />
                </div>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    <Lock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Alteração de password disponível em breve.
                </p>
            </div>
        </div>
    )

    const renderAppearance = () => (
        <div className="card">
            <div className="card-header">
                <button className="btn btn-ghost" onClick={() => setActiveSection('main')}>
                    <ChevronLeft size={18} /> Voltar
                </button>
                <h3 className="card-title">Aparência</h3>
            </div>
            <div style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <label className={styles.toggleItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        {darkMode ? <Moon size={24} /> : <Sun size={24} />}
                        <div>
                            <strong>Modo escuro</strong>
                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Tema escuro ativado</p>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => {
                            setDarkMode(e.target.checked)
                            showToast('Apenas o modo escuro está disponível', 'info')
                        }}
                    />
                </label>
            </div>
        </div>
    )

    const renderDataExport = () => (
        <div className="card">
            <div className="card-header">
                <button className="btn btn-ghost" onClick={() => setActiveSection('main')}>
                    <ChevronLeft size={18} /> Voltar
                </button>
                <h3 className="card-title">Dados e Exportação</h3>
            </div>
            <div style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div className={styles.exportItem}>
                    <div>
                        <strong>Exportar Contactos</strong>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Download de todos os contactos em CSV</p>
                    </div>
                    <button className="btn btn-secondary" onClick={handleExportContacts}>
                        <Download size={18} /> Exportar
                    </button>
                </div>
                <div className={styles.exportItem}>
                    <div>
                        <strong>Exportar Faturas</strong>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Download de todas as faturas em CSV</p>
                    </div>
                    <button className="btn btn-secondary" onClick={handleExportInvoices}>
                        <Download size={18} /> Exportar
                    </button>
                </div>
            </div>
        </div>
    )

    const renderHelpSupport = () => (
        <div className="card">
            <div className="card-header">
                <button className="btn btn-ghost" onClick={() => setActiveSection('main')}>
                    <ChevronLeft size={18} /> Voltar
                </button>
                <h3 className="card-title">Ajuda e Suporte</h3>
            </div>
            <div style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div className={styles.helpItem}>
                    <Keyboard size={24} />
                    <div>
                        <strong>Atalhos de Teclado</strong>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                            <kbd>Ctrl+K</kbd> Pesquisar • <kbd>Ctrl+N</kbd> Novo item • <kbd>Esc</kbd> Fechar modal
                        </p>
                    </div>
                </div>
                <div className={styles.helpItem}>
                    <Mail size={24} />
                    <div>
                        <strong>Contactar Suporte</strong>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                            suporte@crmpo.pt
                        </p>
                    </div>
                </div>
                <div className={styles.helpItem}>
                    <HelpCircle size={24} />
                    <div>
                        <strong>Versão</strong>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                            CRM Pro v1.0.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <>
            <Header title={t('settings')} subtitle={t('manageAccount')} showSearch={false} />

            {activeSection === 'main' && renderMainMenu()}
            {activeSection === 'profile' && renderProfile()}
            {activeSection === 'notifications' && renderNotifications()}
            {activeSection === 'security' && renderSecurity()}
            {activeSection === 'appearance' && renderAppearance()}
            {activeSection === 'dataExport' && renderDataExport()}
            {activeSection === 'helpSupport' && renderHelpSupport()}
        </>
    )
}
