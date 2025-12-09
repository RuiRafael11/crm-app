import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    icon: ReactNode
    trend?: {
        value: number
        isPositive: boolean
    }
    iconColor?: string
}

export default function StatsCard({
    title,
    value,
    icon,
    trend,
    iconColor,
}: StatsCardProps) {
    return (
        <div className="card stats-card fade-in">
            <div className="stats-icon" style={iconColor ? { background: iconColor } : undefined}>
                {icon}
            </div>
            <div className="stats-content">
                <div className="stats-value">{value}</div>
                <div className="stats-label">{title}</div>
                {trend && (
                    <div className={`stats-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                        {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                    </div>
                )}
            </div>
        </div>
    )
}
