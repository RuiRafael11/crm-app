'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  CheckSquare,
  Mail,
  FileText,
  Receipt,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react'
import styles from './Sidebar.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      setLoggingOut(false)
    }
  }

  const navItems = [
    { href: '/', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/contacts', label: t('contacts'), icon: Users },
    { href: '/companies', label: t('companies'), icon: Building2 },
    { href: '/deals', label: t('deals'), icon: DollarSign },
    { href: '/activities', label: t('activities'), icon: CheckSquare },
    { href: '/proposals', label: 'Propostas', icon: FileText },
    { href: '/invoices', label: 'Faturas', icon: Receipt },
    { href: '/emails', label: 'Emails', icon: Mail },
  ]

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Sparkles size={24} />
          </div>
          <span className={styles.logoText}>CRM Pro</span>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href="/settings" className={styles.navLink}>
          <Settings size={20} />
          <span>{t('settings')}</span>
        </Link>
        <button
          className={`${styles.navLink} ${styles.logoutBtn}`}
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut size={20} />
          <span>{loggingOut ? 'A sair...' : t('logout')}</span>
        </button>
        <div className={styles.userInfo}>
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
            alt="User"
            className="avatar avatar-sm"
          />
          <div className={styles.userDetails}>
            <span className={styles.userName}>Administrador</span>
            <span className={styles.userRole}>Admin</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

