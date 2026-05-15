import type React from 'react'
import { GlassCard } from '../GlassCard'
import { NeonButton } from '../NeonButton'

export interface SessionEntry {
  id: string
  game_id: string
  score: number
  completed_at: string
  detail: string | null
}

interface SessionHistoryTableProps {
  sessions: SessionEntry[]
  isLoading: boolean
  onLoadMore: () => void
  hasMore: boolean
}

export const SessionHistoryTable: React.FC<SessionHistoryTableProps> = ({
  sessions,
  isLoading,
  onLoadMore,
  hasMore,
}) => {
  const getGamePill = (gameId: string) => {
    switch (gameId) {
      case 'dojo-3d':
        return (
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            Dojo 3D
          </span>
        )
      case 'cyber-runner':
        return (
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Cyber Runner
          </span>
        )
      case 'card-battler':
        return (
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
            Card Battler
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
            {gameId}
          </span>
        )
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="w-full overflow-hidden p-0">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border-glass bg-bg-secondary/50">
                <th className="py-3 px-4 font-semibold text-text-muted text-sm w-[25%] uppercase tracking-wider">
                  Game
                </th>
                <th className="py-3 px-4 font-semibold text-text-muted text-sm w-[20%] uppercase tracking-wider">
                  Score
                </th>
                <th className="py-3 px-4 font-semibold text-text-muted text-sm w-[35%] uppercase tracking-wider">
                  Details
                </th>
                <th className="py-3 px-4 font-semibold text-text-muted text-sm w-[20%] uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && sessions.length === 0 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border-glass/50">
                    <td className="py-3 px-4">
                      <div className="h-6 w-24 bg-glass rounded animate-pulse" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-5 w-16 bg-glass rounded animate-pulse" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-5 w-32 bg-glass rounded animate-pulse" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-20 bg-glass rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-text-muted"
                  >
                    No games played yet
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-b border-border-glass/50 hover:bg-glass/20 transition-colors duration-200"
                  >
                    <td className="py-3 px-4">
                      {getGamePill(session.game_id)}
                    </td>
                    <td className="py-3 px-4 font-mono text-neon-amber font-bold">
                      {session.score.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-text-muted text-sm">
                      {session.detail || '-'}
                    </td>
                    <td className="py-3 px-4 text-text-muted text-xs">
                      {session.completed_at}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {hasMore && (
        <div className="flex justify-center mt-2">
          <NeonButton
            variant="ghost"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </NeonButton>
        </div>
      )}
    </div>
  )
}
