'use client'

import { X, AlertTriangle } from 'lucide-react'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    type?: 'danger' | 'warning'
    loading?: boolean
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    type = 'danger',
    loading = false,
}: ConfirmDialogProps) {
    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={`${styles.iconWrapper} ${styles[type]}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className={styles.title}>{title}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-warning'}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
