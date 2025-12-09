'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'
import styles from './page.module.css'

export default function LoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Erro no login')
                return
            }

            router.push('/')
            router.refresh()
        } catch {
            setError('Erro ao conectar ao servidor')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.loginHeader}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logo}>
                            <span>CRM</span>
                        </div>
                    </div>
                    <h1>CRM Pro</h1>
                    <p>Entre na sua conta para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    {error && (
                        <div className={styles.errorMessage}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="username">Utilizador</label>
                        <div className={styles.inputWrapper}>
                            <User size={18} className={styles.inputIcon} />
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Introduza o utilizador"
                                required
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Introduza a password"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.loginButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className={styles.spinner}></span>
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>

                <div className={styles.loginFooter}>
                    <p>© 2024 CRM Pro. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    )
}
