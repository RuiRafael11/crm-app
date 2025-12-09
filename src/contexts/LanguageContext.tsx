'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type Language = 'en' | 'pt'

export const translations = {
    en: {
        // Navigation
        dashboard: 'Dashboard',
        contacts: 'Contacts',
        companies: 'Companies',
        deals: 'Deals',
        activities: 'Activities',
        settings: 'Settings',
        logout: 'Log out',

        // Common actions
        addNew: 'Add New',
        addContact: 'Add Contact',
        addCompany: 'Add Company',
        addDeal: 'Add Deal',
        addActivity: 'Add Activity',
        search: 'Search...',
        viewAll: 'View All',
        viewProfile: 'View Profile',
        viewDetails: 'View Details',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',

        // Dashboard
        welcome: "Welcome back! Here's what's happening today.",
        totalContacts: 'Total Contacts',
        activeDeals: 'Active Deals',
        revenue: 'Revenue (Won)',
        pipelineValue: 'Pipeline Value',
        pipelineOverview: 'Pipeline Overview',
        recentActivity: 'Recent Activity',
        upcomingTasks: 'Upcoming Tasks',

        // Settings
        manageAccount: 'Manage your account preferences',
        profile: 'Profile',
        notifications: 'Notifications',
        security: 'Security',
        appearance: 'Appearance',
        dataExport: 'Data & Export',
        helpSupport: 'Help & Support',
        language: 'Language',
        languageDesc: 'Select your preferred language',

        // Contacts page
        contactsInDatabase: 'contacts in your database',
        noContacts: 'No contacts yet',
        addFirstContact: 'Add your first contact to start building your CRM database.',

        // Companies page
        companiesInDatabase: 'companies in your database',
        noCompanies: 'No companies yet',
        addFirstCompany: 'Add your first company to start organizing your business contacts.',
        pipeline: 'Pipeline',

        // Deals page
        dealsPipeline: 'Deals Pipeline',
        inActivePipeline: 'in active pipeline',
        noDealsInStage: 'No deals in this stage',
        probability: 'probability',

        // Deal stages
        lead: 'Lead',
        qualified: 'Qualified',
        proposal: 'Proposal',
        negotiation: 'Negotiation',
        closedWon: 'Closed Won',
        closedLost: 'Closed Lost',

        // Activities page
        pendingTasks: 'pending tasks',
        pending: 'Pending',
        dueToday: 'Due Today',
        overdue: 'Overdue',
        completed: 'Completed',
        pendingActivities: 'Pending Activities',
        allCaughtUp: 'All caught up!',
        noPendingActivities: 'No pending activities at the moment.',

        // Activity types
        call: 'Call',
        email: 'Email',
        meeting: 'Meeting',
        task: 'Task',

        // Dates
        today: 'Today',
        tomorrow: 'Tomorrow',
        yesterday: 'Yesterday',
        inDays: 'In {days} days',
        noDate: 'No date',

        // Toast messages
        contactCreated: 'Contact created successfully',
        contactUpdated: 'Contact updated successfully',
        contactDeleted: 'Contact deleted successfully',
        companyCreated: 'Company created successfully',
        companyUpdated: 'Company updated successfully',
        companyDeleted: 'Company deleted successfully',
        dealCreated: 'Deal created successfully',
        dealUpdated: 'Deal updated successfully',
        dealDeleted: 'Deal deleted successfully',
        activityCreated: 'Activity created successfully',
        activityUpdated: 'Activity updated successfully',
        activityDeleted: 'Activity deleted successfully',
        errorOccurred: 'An error occurred. Please try again.',

        // Search
        noResults: 'No results found',
        searchResults: 'Search results',

        // Settings
        comingSoon: 'Coming Soon',
    },
    pt: {
        // Navigation
        dashboard: 'Painel',
        contacts: 'Contactos',
        companies: 'Empresas',
        deals: 'Negócios',
        activities: 'Atividades',
        settings: 'Definições',
        logout: 'Terminar sessão',

        // Common actions
        addNew: 'Novo',
        addContact: 'Adicionar Contacto',
        addCompany: 'Adicionar Empresa',
        addDeal: 'Adicionar Negócio',
        addActivity: 'Adicionar Atividade',
        search: 'Pesquisar...',
        viewAll: 'Ver Tudo',
        viewProfile: 'Ver Perfil',
        viewDetails: 'Ver Detalhes',
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        create: 'Criar',
        update: 'Atualizar',

        // Dashboard
        welcome: 'Bem-vindo! Eis o que está a acontecer hoje.',
        totalContacts: 'Total de Contactos',
        activeDeals: 'Negócios Ativos',
        revenue: 'Receita (Ganha)',
        pipelineValue: 'Valor do Pipeline',
        pipelineOverview: 'Visão Geral do Pipeline',
        recentActivity: 'Atividade Recente',
        upcomingTasks: 'Próximas Tarefas',

        // Settings
        manageAccount: 'Gerir as suas preferências de conta',
        profile: 'Perfil',
        notifications: 'Notificações',
        security: 'Segurança',
        appearance: 'Aparência',
        dataExport: 'Dados e Exportação',
        helpSupport: 'Ajuda e Suporte',
        language: 'Idioma',
        languageDesc: 'Selecione o seu idioma preferido',

        // Contacts page
        contactsInDatabase: 'contactos na sua base de dados',
        noContacts: 'Ainda não há contactos',
        addFirstContact: 'Adicione o seu primeiro contacto para começar a construir a sua base de dados CRM.',

        // Companies page
        companiesInDatabase: 'empresas na sua base de dados',
        noCompanies: 'Ainda não há empresas',
        addFirstCompany: 'Adicione a sua primeira empresa para começar a organizar os seus contactos comerciais.',
        pipeline: 'Pipeline',

        // Deals page
        dealsPipeline: 'Pipeline de Negócios',
        inActivePipeline: 'em pipeline ativo',
        noDealsInStage: 'Sem negócios nesta fase',
        probability: 'probabilidade',

        // Deal stages
        lead: 'Lead',
        qualified: 'Qualificado',
        proposal: 'Proposta',
        negotiation: 'Negociação',
        closedWon: 'Fechado (Ganho)',
        closedLost: 'Fechado (Perdido)',

        // Activities page
        pendingTasks: 'tarefas pendentes',
        pending: 'Pendente',
        dueToday: 'Vence Hoje',
        overdue: 'Atrasado',
        completed: 'Concluído',
        pendingActivities: 'Atividades Pendentes',
        allCaughtUp: 'Tudo em dia!',
        noPendingActivities: 'Sem atividades pendentes de momento.',

        // Activity types
        call: 'Chamada',
        email: 'E-mail',
        meeting: 'Reunião',
        task: 'Tarefa',

        // Dates
        today: 'Hoje',
        tomorrow: 'Amanhã',
        yesterday: 'Ontem',
        inDays: 'Em {days} dias',
        noDate: 'Sem data',

        // Toast messages
        contactCreated: 'Contacto criado com sucesso',
        contactUpdated: 'Contacto atualizado com sucesso',
        contactDeleted: 'Contacto eliminado com sucesso',
        companyCreated: 'Empresa criada com sucesso',
        companyUpdated: 'Empresa atualizada com sucesso',
        companyDeleted: 'Empresa eliminada com sucesso',
        dealCreated: 'Negócio criado com sucesso',
        dealUpdated: 'Negócio atualizado com sucesso',
        dealDeleted: 'Negócio eliminado com sucesso',
        activityCreated: 'Atividade criada com sucesso',
        activityUpdated: 'Atividade atualizada com sucesso',
        activityDeleted: 'Atividade eliminada com sucesso',
        errorOccurred: 'Ocorreu um erro. Por favor, tente novamente.',

        // Search
        noResults: 'Nenhum resultado encontrado',
        searchResults: 'Resultados da pesquisa',

        // Settings
        comingSoon: 'Em Breve',
    },
}

export type TranslationKey = keyof typeof translations.en

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en')
    const [isHydrated, setIsHydrated] = useState(false)

    // Load language from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('crm-language') as Language | null
        if (saved && (saved === 'en' || saved === 'pt')) {
            setLanguageState(saved)
        }
        setIsHydrated(true)
    }, [])

    // Save language to localStorage when changed
    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('crm-language', lang)
    }

    const t = (key: TranslationKey) => {
        return translations[language][key] || key
    }

    // Prevent hydration mismatch
    if (!isHydrated) {
        return null
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
