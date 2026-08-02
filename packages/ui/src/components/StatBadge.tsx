import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import type React from 'react'
import { GlassCard } from '../GlassCard'

interface StatBadgeProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  color?: 'cyan' | 'purple' | 'amber' | 'green'
  animated?: boolean
}

export const StatBadge: React.FC<StatBadgeProps> = ({
  label,
  value,
  icon,
  color = 'cyan',
  animated = false,
}) => {
  const valueRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (animated && typeof value === 'number' && valueRef.current) {
      const obj = { val: 0 }
      const tween = gsap.to(obj, {
        val: value,
        duration: 1,
        ease: 'power2.out',
        onUpdate: () => {
          if (valueRef.current) {
            valueRef.current.innerText = Math.round(obj.val).toString()
          }
        },
      })
      return () => {
        tween.kill()
      }
    }
  }, [value, animated])

  const colorClasses = {
    cyan: 'text-neon-cyan',
    purple: 'text-neon-purple',
    amber: 'text-neon-amber',
    green: 'text-neon-green',
  }

  return (
    <GlassCard className="min-w-[140px] flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-text-muted">{icon}</span>}
        <span className="text-text-muted text-xs uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div
        ref={valueRef}
        className={`text-2xl font-bold font-mono ${colorClasses[color]}`}
      >
        {animated && typeof value === 'number' ? '0' : value}
      </div>
    </GlassCard>
  )
}
