'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
    Phone,
    Mail,
    Calendar,
    ClipboardList,
    CheckSquare,
    Check,
    Clock,
    User,
    DollarSign,
    Edit,
    Trash2,
} from 'lucide-react'
import Header from '@/components/Header'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import ActivityForm from '@/components/forms/ActivityForm'
import styles from '@/app/activities/page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSearch } from '@/contexts/SearchContext'
import { useToast } from '@/components/Toast'

interface Activity {
    id: string
    title: string
    description: string | null
    type: string
    dueDate: Date | null
    completed: boolean
    contactId: string | null
    dealId: string | null
    contact: { firstName: string; lastName: string } | null
    deal: { title: string } | null
}

interface Contact {
    id: string
    firstName: string
    lastName: string
}

interface Deal {
    id: string
    title: string
}

interface ActivitiesViewProps {
    activities: Activity[]
    contacts: Contact[]
    deals: Deal[]
}

function formatDate(date: Date | null, t: (key: any) => string) {
    if (!date) return t('noDate')
    const now = new Date()
    const activityDate = new Date(date)
    const diffTime = activityDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return t('today')
    if (diffDays === 1) return t('tomorrow')
    if (diffDays === -1) return t('yesterday')
    if (diffDays < -1) {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
        }).format(activityDate)
    }
    if (diffDays <= 7) return `${diffDays} days`

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(activityDate)
}

function isOverdue(date: Date | null, completed: boolean) {
    if (!date || completed) return false
    return new Date(date) < new Date()
}

function getActivityIcon(type: string) {
    switch (type) {
        case 'call':
            return <Phone size={18} />
        case 'email':
            return <Mail size={18} />
        case 'meeting':
            return <Calendar size={18} />
        case 'task':
            return <ClipboardList size={18} />
        default:
            return <CheckSquare size={18} />
    }
}

function getActivityColor(type: string) {
    switch (type) {
        case 'call':
            return { bg: 'var(--success-bg)', color: 'var(--success)' }
        case 'email':
            return { bg: 'var(--info-bg)', color: 'var(--info)' }
        case 'meeting':
            return { bg: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-primary)' }
        case 'task':
            return { bg: 'var(--warning-bg)', color: 'var(--warning)' }
        default:
            return { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }
    }
}

const typeBadgeStyles: Record<string, string> = {
    call: styles.activityTypeBadgeCall,
    email: styles.activityTypeBadgeEmail,
    meeting: styles.activityTypeBadgeMeeting,
    task: styles.activityTypeBadgeTask,
}

export default function ActivitiesView({ activities, contacts, deals }: ActivitiesViewProps) {
    const { t } = useLanguage()
    const { searchQuery } = useSearch()
    const { showToast } = useToast()
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; activity: Activity | null }>({
        isOpen: false,
        activity: null,
    })
    const [isDeleting, setIsDeleting] = useState(false)

    const filteredActivities = useMemo(() => {
        if (!searchQuery.trim()) return activities
        const query = searchQuery.toLowerCase()
        return activities.filter((activity) =>
            activity.title.toLowerCase().includes(query) ||
            activity.description?.toLowerCase().includes(query) ||
            activity.contact?.firstName.toLowerCase().includes(query) ||
            activity.deal?.title.toLowerCase().includes(query)
        )
    }, [activities, searchQuery])

    const pendingActivities = filteredActivities.filter((a) => !a.completed)
    const completedActivities = filteredActivities.filter((a) => a.completed)
    const overdueCount = filteredActivities.filter((a) => isOverdue(a.dueDate, a.completed)).length
    const todayCount = filteredActivities.filter((a) => {
        if (!a.dueDate || a.completed) return false
        const today = new Date()
        const dueDate = new Date(a.dueDate)
        return (
            dueDate.getDate() === today.getDate() &&
            dueDate.getMonth() === today.getMonth() &&
            dueDate.getFullYear() === today.getFullYear()
        )
    }).length

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'call': return t('call')
            case 'email': return t('email')
            case 'meeting': return t('meeting')
            case 'task': return t('task')
            default: return type
        }
    }

    const handleAdd = () => {
        setEditingActivity(null)
        setIsModalOpen(true)
    }

    const handleEdit = (activity: Activity) => {
        setEditingActivity(activity)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (activity: Activity) => {
        setDeleteConfirm({ isOpen: true, activity })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.activity) return
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/activities/${deleteConfirm.activity.id}`, { method: 'DELETE' })
            if (response.ok) {
                showToast(t('activityDeleted'), 'success')
                router.refresh()
            } else {
                showToast(t('errorOccurred'), 'error')
            }
        } catch {
            showToast(t('errorOccurred'), 'error')
        } finally {
            setIsDeleting(false)
            setDeleteConfirm({ isOpen: false, activity: null })
        }
    }

    const handleToggleComplete = async (activity: Activity) => {
        try {
            const response = await fetch(`/api/activities/${activity.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...activity, completed: !activity.completed }),
            })
            if (response.ok) {
                showToast(activity.completed ? t('pending') : t('completed'), 'success')
                router.refresh()
            }
        } catch (error) {
            showToast(t('errorOccurred'), 'error')
        }
    }

    const handleSuccess = (isEdit: boolean) => {
        setIsModalOpen(false)
        setEditingActivity(null)
        showToast(isEdit ? t('activityUpdated') : t('activityCreated'), 'success')
    }

    return (
        <>
            <Header
                title={t('activities')}
                subtitle={`${pendingActivities.length} ${t('pendingTasks')}`}
                showAddButton
                addButtonLabel={t('addActivity')}
                onAddClick={handleAdd}
            />

            {/* Quick Stats */}
            <div className={styles.activityStats}>
                <div className={styles.activityStat}>
                    <div className={`${styles.statIcon} ${styles.statIconPending}`}>
                        <Clock size={18} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{pendingActivities.length}</span>
                        <span className={styles.statLabel}>{t('pending')}</span>
                    </div>
                </div>
                <div className={styles.activityStat}>
                    <div className={`${styles.statIcon} ${styles.statIconToday}`}>
                        <Calendar size={18} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{todayCount}</span>
                        <span className={styles.statLabel}>{t('dueToday')}</span>
                    </div>
                </div>
                <div className={styles.activityStat}>
                    <div className={`${styles.statIcon} ${styles.statIconOverdue}`}>
                        <Clock size={18} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{overdueCount}</span>
                        <span className={styles.statLabel}>{t('overdue')}</span>
                    </div>
                </div>
                <div className={styles.activityStat}>
                    <div className={`${styles.statIcon} ${styles.statIconCompleted}`}>
                        <Check size={18} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{completedActivities.length}</span>
                        <span className={styles.statLabel}>{t('completed')}</span>
                    </div>
                </div>
            </div>

            <div className={styles.activitiesContainer}>
                {/* Pending Activities */}
                <div className={styles.activitiesSection}>
                    <h3 className={styles.sectionTitle}>{t('pendingActivities')}</h3>
                    <div className={styles.activitiesList}>
                        {pendingActivities.map((activity) => {
                            const colors = getActivityColor(activity.type)
                            const overdue = isOverdue(activity.dueDate, activity.completed)

                            return (
                                <div key={activity.id} className={`${styles.activityItem} card ${overdue ? styles.activityItemOverdue : ''}`}>
                                    <div className={styles.activityCheckbox}>
                                        <div
                                            className="checkbox"
                                            onClick={() => handleToggleComplete(activity)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>

                                    <div
                                        className={styles.activityTypeIcon}
                                        style={{ background: colors.bg, color: colors.color }}
                                    >
                                        {getActivityIcon(activity.type)}
                                    </div>

                                    <div className={styles.activityContent}>
                                        <div className={styles.activityHeader}>
                                            <h4 className={styles.activityTitle}>{activity.title}</h4>
                                            <div className={styles.activityActions}>
                                                <button
                                                    className="btn btn-icon btn-ghost btn-xs"
                                                    onClick={() => handleEdit(activity)}
                                                    title={t('edit')}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-icon btn-ghost btn-xs"
                                                    onClick={() => handleDeleteClick(activity)}
                                                    title={t('delete')}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <span className={`${styles.activityTypeBadge} ${typeBadgeStyles[activity.type] || ''}`}>
                                                    {getTypeLabel(activity.type)}
                                                </span>
                                            </div>
                                        </div>

                                        {activity.description && (
                                            <p className={styles.activityDescription}>{activity.description}</p>
                                        )}

                                        <div className={styles.activityMeta}>
                                            {activity.contact && (
                                                <div className={styles.activityMetaItem}>
                                                    <User size={12} />
                                                    <span>
                                                        {activity.contact.firstName} {activity.contact.lastName}
                                                    </span>
                                                </div>
                                            )}
                                            {activity.deal && (
                                                <div className={styles.activityMetaItem}>
                                                    <DollarSign size={12} />
                                                    <span>{activity.deal.title}</span>
                                                </div>
                                            )}
                                            {activity.dueDate && (
                                                <div className={`${styles.activityMetaItem} ${overdue ? styles.activityMetaItemOverdue : ''}`}>
                                                    <Clock size={12} />
                                                    <span>{formatDate(activity.dueDate, t)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {pendingActivities.length === 0 && (
                            <div className={styles.emptyState}>
                                <CheckSquare size={48} />
                                <h4>{t('allCaughtUp')}</h4>
                                <p>{t('noPendingActivities')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed Activities */}
                <div className={styles.activitiesSection}>
                    <h3 className={styles.sectionTitle}>{t('completed')}</h3>
                    <div className={`${styles.activitiesList} ${styles.completedList}`}>
                        {completedActivities.map((activity) => {
                            const colors = getActivityColor(activity.type)

                            return (
                                <div key={activity.id} className={`${styles.activityItem} ${styles.activityItemCompleted} card`}>
                                    <div className={styles.activityCheckbox}>
                                        <div
                                            className="checkbox checked"
                                            onClick={() => handleToggleComplete(activity)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Check size={12} />
                                        </div>
                                    </div>

                                    <div
                                        className={styles.activityTypeIcon}
                                        style={{ background: colors.bg, color: colors.color }}
                                    >
                                        {getActivityIcon(activity.type)}
                                    </div>

                                    <div className={styles.activityContent}>
                                        <h4 className={`${styles.activityTitle} ${styles.activityTitleCompleted}`}>{activity.title}</h4>
                                        <div className={styles.activityMeta}>
                                            {activity.contact && (
                                                <div className={styles.activityMetaItem}>
                                                    <User size={12} />
                                                    <span>
                                                        {activity.contact.firstName} {activity.contact.lastName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingActivity ? t('edit') + ' ' + t('activities') : t('addActivity')}
            >
                <ActivityForm
                    activity={editingActivity || undefined}
                    contacts={contacts}
                    deals={deals}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => handleSuccess(!!editingActivity)}
                />
            </Modal>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, activity: null })}
                onConfirm={handleDeleteConfirm}
                title={t('delete') + ' ' + t('activities')}
                message={`Are you sure you want to delete "${deleteConfirm.activity?.title}"? This action cannot be undone.`}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                loading={isDeleting}
            />
        </>
    )
}
