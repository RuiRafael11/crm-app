'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
    Globe,
    Phone,
    MapPin,
    Users,
    DollarSign,
    Building2,
    Edit,
    Trash2,
} from 'lucide-react'
import Header from '@/components/Header'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import CompanyForm from '@/components/forms/CompanyForm'
import styles from '@/app/companies/page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSearch } from '@/contexts/SearchContext'
import { useToast } from '@/components/Toast'

interface Company {
    id: string
    name: string
    industry: string
    website: string | null
    phone: string | null
    address: string | null
    logo: string | null
    _count: { contacts: number; deals: number }
    deals: { value: number; stage: string }[]
}

interface CompaniesViewProps {
    companies: Company[]
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

function getIndustryColor(industry: string) {
    const colors: Record<string, string> = {
        Technology: 'rgba(139, 92, 246, 0.15)',
        Finance: 'rgba(34, 197, 94, 0.15)',
        Healthcare: 'rgba(59, 130, 246, 0.15)',
        Retail: 'rgba(245, 158, 11, 0.15)',
        Manufacturing: 'rgba(239, 68, 68, 0.15)',
    }
    return colors[industry] || 'rgba(113, 113, 122, 0.15)'
}

function getIndustryTextColor(industry: string) {
    const colors: Record<string, string> = {
        Technology: '#a78bfa',
        Finance: '#22c55e',
        Healthcare: '#3b82f6',
        Retail: '#f59e0b',
        Manufacturing: '#ef4444',
    }
    return colors[industry] || '#71717a'
}

export default function CompaniesView({ companies }: CompaniesViewProps) {
    const { t } = useLanguage()
    const { searchQuery } = useSearch()
    const { showToast } = useToast()
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCompany, setEditingCompany] = useState<Company | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; company: Company | null }>({
        isOpen: false,
        company: null,
    })
    const [isDeleting, setIsDeleting] = useState(false)

    const filteredCompanies = useMemo(() => {
        if (!searchQuery.trim()) return companies
        const query = searchQuery.toLowerCase()
        return companies.filter((company) =>
            company.name.toLowerCase().includes(query) ||
            company.industry.toLowerCase().includes(query) ||
            company.address?.toLowerCase().includes(query)
        )
    }, [companies, searchQuery])

    const handleAdd = () => {
        setEditingCompany(null)
        setIsModalOpen(true)
    }

    const handleEdit = (company: Company) => {
        setEditingCompany(company)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (company: Company) => {
        setDeleteConfirm({ isOpen: true, company })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.company) return
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/companies/${deleteConfirm.company.id}`, { method: 'DELETE' })
            if (response.ok) {
                showToast(t('companyDeleted'), 'success')
                router.refresh()
            } else {
                showToast(t('errorOccurred'), 'error')
            }
        } catch {
            showToast(t('errorOccurred'), 'error')
        } finally {
            setIsDeleting(false)
            setDeleteConfirm({ isOpen: false, company: null })
        }
    }

    const handleSuccess = (isEdit: boolean) => {
        setIsModalOpen(false)
        setEditingCompany(null)
        showToast(isEdit ? t('companyUpdated') : t('companyCreated'), 'success')
    }

    return (
        <>
            <Header
                title={t('companies')}
                subtitle={`${filteredCompanies.length} ${t('companiesInDatabase')}`}
                showAddButton
                addButtonLabel={t('addCompany')}
                onAddClick={handleAdd}
            />

            <div className={styles.companiesGrid}>
                {filteredCompanies.map((company, index) => {
                    const totalPipelineValue = company.deals.reduce((sum, d) => sum + d.value, 0)

                    return (
                        <div
                            key={company.id}
                            className={`${styles.companyCard} card fade-in stagger-${(index % 5) + 1}`}
                        >
                            <div className={styles.companyHeader}>
                                <div className={styles.companyLogo}>
                                    <img
                                        src={company.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${company.name}`}
                                        alt={company.name}
                                    />
                                </div>
                                <div className={styles.cardActions}>
                                    <button
                                        className="btn btn-icon btn-ghost"
                                        onClick={() => handleEdit(company)}
                                        title={t('edit')}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className="btn btn-icon btn-ghost"
                                        onClick={() => handleDeleteClick(company)}
                                        title={t('delete')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.companyBody}>
                                <h3 className={styles.companyName}>{company.name}</h3>
                                <span
                                    className={styles.industryBadge}
                                    style={{
                                        background: getIndustryColor(company.industry),
                                        color: getIndustryTextColor(company.industry),
                                    }}
                                >
                                    {company.industry}
                                </span>

                                <div className={styles.companyDetails}>
                                    {company.website && (
                                        <a
                                            href={company.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.companyDetail}
                                        >
                                            <Globe size={14} />
                                            <span>{company.website.replace(/^https?:\/\//, '')}</span>
                                        </a>
                                    )}
                                    {company.phone && (
                                        <a href={`tel:${company.phone}`} className={styles.companyDetail}>
                                            <Phone size={14} />
                                            <span>{company.phone}</span>
                                        </a>
                                    )}
                                    {company.address && (
                                        <div className={styles.companyDetail}>
                                            <MapPin size={14} />
                                            <span>{company.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.companyStats}>
                                <div className={styles.companyStat}>
                                    <div className={`${styles.statIcon} ${styles.statIconContacts}`}>
                                        <Users size={16} />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{company._count.contacts}</span>
                                        <span className={styles.statLabel}>{t('contacts')}</span>
                                    </div>
                                </div>
                                <div className={styles.companyStat}>
                                    <div className={`${styles.statIcon} ${styles.statIconDeals}`}>
                                        <DollarSign size={16} />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{company._count.deals}</span>
                                        <span className={styles.statLabel}>{t('deals')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.companyFooter}>
                                <div className={styles.pipelineInfo}>
                                    <span className={styles.pipelineLabel}>{t('pipeline')}</span>
                                    <span className={styles.pipelineValue}>{formatCurrency(totalPipelineValue)}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filteredCompanies.length === 0 && (
                <div className="empty-state card">
                    <Building2 size={64} className="empty-state-icon" />
                    <h3 className="empty-state-title">{searchQuery ? t('noResults') : t('noCompanies')}</h3>
                    <p className="empty-state-description">
                        {searchQuery ? '' : t('addFirstCompany')}
                    </p>
                    {!searchQuery && (
                        <button className="btn btn-primary mt-md" onClick={handleAdd}>{t('addCompany')}</button>
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCompany ? t('edit') + ' ' + t('companies') : t('addCompany')}
            >
                <CompanyForm
                    company={editingCompany || undefined}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => handleSuccess(!!editingCompany)}
                />
            </Modal>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, company: null })}
                onConfirm={handleDeleteConfirm}
                title={t('delete') + ' ' + t('companies')}
                message={`Are you sure you want to delete ${deleteConfirm.company?.name}? This action cannot be undone.`}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                loading={isDeleting}
            />
        </>
    )
}
