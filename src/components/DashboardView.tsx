'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import StatsCard from '@/components/StatsCard'
import {
    Users,
    DollarSign,
    TrendingUp,
    CheckSquare,
    Phone,
    Mail,
    Calendar,
    ClipboardList,
    ArrowRight,
    Building2,
    Check,
} from 'lucide-react'
import styles from '@/app/page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

interface DashboardData {
    totalContacts: number
    totalCompanies: number
    activeDeals: number
    totalRevenue: number
    pipelineValue: number
    dealsByStage: Record<string, any[]>
    recentActivities: any[]
    upcomingTasks: any[]
}

const stageLabels: Record<string, string> = {
    lead: 'Potencial',
    qualified: 'Qualificado',
    proposal: 'Proposta',
    negotiation: 'Negociação',
    'closed-won': 'Ganho',
    'closed-lost': 'Perdido',
}

const stageStyles: Record<string, string> = {
    lead: styles.stageLead,
    qualified: styles.stageQualified,
    proposal: styles.stageProposal,
    negotiation: styles.stageNegotiation,
    'closed-won': styles.stageClosedWon,
    'closed-lost': styles.stageClosedLost,
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat('pt-PT', {
        month: 'short',
        day: 'numeric',
    }).format(new Date(date))
}

function getActivityIcon(type: string) {
    switch (type) {
        case 'call':
            return <Phone size={16} />
        case 'email':
            return <Mail size={16} />
        case 'meeting':
            return <Calendar size={16} />
        case 'task':
            return <ClipboardList size={16} />
        default:
            return <CheckSquare size={16} />
    }
}

export default function DashboardView({ data }: { data: DashboardData }) {
    const { t } = useLanguage()
    const router = useRouter()
    const [completingTask, setCompletingTask] = useState<number | null>(null)

    const handleCompleteTask = async (taskId: number) => {
        setCompletingTask(taskId)
        try {
            await fetch(`/api/activities/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: true }),
            })
            router.refresh()
        } catch (error) {
            console.error('Error completing task:', error)
        } finally {
            setCompletingTask(null)
        }
    }

    return (
        <>
            <Header
                title={t('dashboard')}
                subtitle={t('welcome')}
            />

            {/* Stats Grid */}
            <div className="grid grid-4 mb-lg">
                <div className="stagger-1">
                    <StatsCard
                        title={t('totalContacts')}
                        value={data.totalContacts}
                        icon={<Users size={24} />}
                        trend={{ value: 12, isPositive: true }}
                    />
                </div>
                <div className="stagger-2">
                    <StatsCard
                        title={t('activeDeals')}
                        value={data.activeDeals}
                        icon={<DollarSign size={24} />}
                        trend={{ value: 8, isPositive: true }}
                    />
                </div>
                <div className="stagger-3">
                    <StatsCard
                        title={t('revenue')}
                        value={formatCurrency(data.totalRevenue)}
                        icon={<TrendingUp size={24} />}
                        trend={{ value: 24, isPositive: true }}
                    />
                </div>
                <div className="stagger-4">
                    <StatsCard
                        title={t('pipelineValue')}
                        value={formatCurrency(data.pipelineValue)}
                        icon={<Building2 size={24} />}
                        trend={{ value: 15, isPositive: true }}
                    />
                </div>
            </div>

            <div className={styles.dashboardGrid}>
                {/* Pipeline Overview */}
                <div className="card fade-in">
                    <div className="card-header">
                        <h3 className="card-title">{t('pipelineOverview')}</h3>
                        <Link href="/deals" className="btn btn-ghost btn-sm">
                            {t('viewAll')} <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className={styles.pipelineOverview}>
                        {Object.entries(data.dealsByStage).map(([stage, deals]) => {
                            const value = deals.reduce((sum: number, d: any) => sum + d.value, 0)
                            return (
                                <div key={stage} className={styles.pipelineStage}>
                                    <div className={styles.pipelineStageHeader}>
                                        <span className={`badge badge-${stage}`}>{stageLabels[stage]}</span>
                                        <span className={styles.pipelineStageCount}>{deals.length}</span>
                                    </div>
                                    <div className={styles.pipelineStageValue}>{formatCurrency(value)}</div>
                                    <div className={styles.pipelineStageBar}>
                                        <div
                                            className={`${styles.pipelineStageFill} ${stageStyles[stage]}`}
                                            style={{
                                                width: `${Math.min((value / (data.pipelineValue || 1)) * 100, 100)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card fade-in">
                    <div className="card-header">
                        <h3 className="card-title">{t('recentActivity')}</h3>
                        <Link href="/activities" className="btn btn-ghost btn-sm">
                            {t('viewAll')} <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className={styles.activityList}>
                        {data.recentActivities.map((activity) => (
                            <div key={activity.id} className={styles.activityItem}>
                                <div className={`activity-icon ${activity.type}`}>
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className={styles.activityContent}>
                                    <div className={styles.activityTitle}>{activity.title}</div>
                                    <div className={styles.activityMeta}>
                                        {activity.contact && (
                                            <span>with {activity.contact.firstName} {activity.contact.lastName}</span>
                                        )}
                                        {activity.dueDate && (
                                            <span className={styles.activityDate}>
                                                {formatDate(activity.dueDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {activity.completed && (
                                    <div className={styles.activityStatusCompleted}>
                                        <Check size={14} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Tasks */}
                <div className="card fade-in">
                    <div className="card-header">
                        <h3 className="card-title">{t('upcomingTasks')}</h3>
                        <Link href="/activities" className="btn btn-ghost btn-sm">
                            {t('viewAll')} <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className={styles.taskList}>
                        {data.upcomingTasks.map((task) => (
                            <div key={task.id} className={styles.taskItem}>
                                <div
                                    className={`checkbox ${completingTask === task.id ? 'loading' : ''}`}
                                    onClick={() => handleCompleteTask(task.id)}
                                    style={{ cursor: 'pointer' }}
                                    title="Marcar como concluída"
                                >
                                    {completingTask === task.id ? (
                                        <span className="spinner-small"></span>
                                    ) : task.completed ? (
                                        <Check size={12} />
                                    ) : null}
                                </div>
                                <div className={styles.taskContent}>
                                    <div className={styles.taskTitle}>{task.title}</div>
                                    <div className={styles.taskMeta}>
                                        <span className={`${styles.activityType} ${styles[`activityType${task.type.charAt(0).toUpperCase() + task.type.slice(1)}`]}`}>{task.type}</span>
                                        {task.dueDate && (
                                            <span className={styles.taskDate}>{formatDate(task.dueDate)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {data.upcomingTasks.length === 0 && (
                            <div className="empty-state">
                                <CheckSquare size={32} className="empty-state-icon" />
                                <p className="text-muted">Sem tarefas pendentes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
