'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import styles from './Toast.module.css'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now().toString()
        setToasts((prev) => [...prev, { id, message, type }])

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 4000)
    }, [])

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} />
            case 'error':
                return <AlertCircle size={20} />
            case 'warning':
                return <AlertTriangle size={20} />
            default:
                return <Info size={20} />
        }
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map((toast) => (
                    <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
                        <div className={styles.toastIcon}>{getIcon(toast.type)}</div>
                        <span className={styles.toastMessage}>{toast.message}</span>
                        <button className={styles.toastClose} onClick={() => removeToast(toast.id)}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
