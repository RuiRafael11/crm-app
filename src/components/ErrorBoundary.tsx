'use client'

import { Component, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="error-boundary">
                        <div className="error-content">
                            <h2>Something went wrong</h2>
                            <p>Please refresh the page or try again later.</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => window.location.reload()}
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                )
            )
        }

        return this.props.children
    }
}
