'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Bell, Plus, X, CheckCircle, AlertCircle, Info, LogOut, User } from 'lucide-react'
import styles from './Header.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSearch } from '@/contexts/SearchContext'

interface HeaderProps {
  title: string
  subtitle?: string
  showSearch?: boolean
  showAddButton?: boolean
  addButtonLabel?: string
  onAddClick?: () => void
}

// Sample notifications with links
const sampleNotifications = [
  { id: 1, type: 'success', message: 'Novo negócio criado', time: '5 min', link: '/deals' },
  { id: 2, type: 'info', message: 'Reunião agendada para amanhã', time: '1 hora', link: '/activities' },
  { id: 3, type: 'warning', message: 'Tarefa em atraso', time: '2 horas', link: '/activities' },
]

export default function Header({
  title,
  subtitle,
  showSearch = true,
  showAddButton = false,
  addButtonLabel,
  onAddClick,
}: HeaderProps) {
  const { t } = useLanguage()
  const { searchQuery, setSearchQuery } = useSearch()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      // Force full page reload to clear all state
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      setLoggingOut(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className={styles.notifIconSuccess} />
      case 'warning': return <AlertCircle size={16} className={styles.notifIconWarning} />
      default: return <Info size={16} className={styles.notifIconInfo} />
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      <div className={styles.headerRight}>
        {showSearch && (
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t('search')}
              className={`form-input ${styles.searchInput}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <div className={styles.notificationWrapper}>
          <button
            className={`btn btn-icon btn-ghost ${styles.notificationBtn}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className={styles.notificationBadge}>{sampleNotifications.length}</span>
          </button>

          {showNotifications && (
            <div className={styles.notificationPanel}>
              <div className={styles.notifHeader}>
                <h4>Notificações</h4>
                <button
                  className="btn btn-icon btn-ghost btn-xs"
                  onClick={() => setShowNotifications(false)}
                >
                  <X size={14} />
                </button>
              </div>
              <div className={styles.notifList}>
                {sampleNotifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.link}
                    className={styles.notifItem}
                    onClick={() => setShowNotifications(false)}
                  >
                    {getNotificationIcon(notif.type)}
                    <div className={styles.notifContent}>
                      <p className={styles.notifMessage}>{notif.message}</p>
                      <span className={styles.notifTime}>{notif.time}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className={styles.notifFooter}>
                <button className="btn btn-ghost btn-sm">Ver Todas</button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className={styles.notificationWrapper}>
          <button
            className={`btn btn-icon btn-ghost ${styles.notificationBtn}`}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <User size={20} />
          </button>

          {showUserMenu && (
            <div className={styles.notificationPanel}>
              <div className={styles.notifHeader}>
                <h4>Conta</h4>
                <button
                  className="btn btn-icon btn-ghost btn-xs"
                  onClick={() => setShowUserMenu(false)}
                >
                  <X size={14} />
                </button>
              </div>
              <div className={styles.notifList}>
                <button
                  className={styles.logoutBtn}
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut size={16} />
                  {loggingOut ? 'A sair...' : 'Terminar Sessão'}
                </button>
              </div>
            </div>
          )}
        </div>

        {showAddButton && (
          <button className="btn btn-primary" onClick={onAddClick}>
            <Plus size={18} />
            {addButtonLabel || t('addNew')}
          </button>
        )}
      </div>
    </header>
  )
}

