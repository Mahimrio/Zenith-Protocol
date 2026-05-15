import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useProfile } from '../hooks/useProfile'
import { NeonGrid } from '../components/NeonGrid'
import { Navbar } from '../components/Navbar'
import {
  GlassCard,
  ScoreDisplay,
  StatBadge,
  SessionHistoryTable,
  AvatarUpload,
  NeonButton,
} from '@zenith/ui'

export default function ProfilePage() {
  const navigate = useNavigate()
  const {
    profile,
    sessions,
    isLoadingProfile,
    isLoadingSessions,
    hasMore,
    loadMore,
    selectedGame,
    setSelectedGame,
    uploadAvatar,
  } = useProfile()

  const bannerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)>([])
  const [isUploading, setIsUploading] = useState(false)

  // Entrance animations
  useEffect(() => {
    if (!isLoadingProfile && profile) {
      if (bannerRef.current) {
        gsap.from(bannerRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
        })
      }
      
      if (cardsRef.current.length > 0) {
        gsap.from(cardsRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.2,
        })
      }
    }
  }, [isLoadingProfile, profile])

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true)
      await uploadAvatar(file)
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoadingProfile || !profile) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center">
        <NeonGrid />
        <div className="relative z-10 text-xl text-neon-cyan animate-pulse">Loading Profile...</div>
      </div>
    )
  }

  // Calculate best rank
  const ranks = Object.values(profile.global_ranks).filter((r): r is number => r !== null)
  const bestRank = ranks.length > 0 ? Math.min(...ranks) : null

  const tabs = [
    { id: null, label: 'All' },
    { id: 'dojo-3d', label: 'Dojo 3D' },
    { id: 'card-battler', label: 'Card Battler' },
    { id: 'cyber-runner', label: 'Cyber Runner' },
  ]

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden relative">
      <NeonGrid />
      <Navbar />

      <main className="relative z-10 container mx-auto px-4 py-8 mt-16 max-w-5xl flex flex-col gap-12">
        {/* SECTION 1 - Hero Banner */}
        <section
          ref={bannerRef}
          className="flex flex-col md:flex-row items-center justify-between gap-6 bg-bg-secondary/40 border border-border-glass rounded-2xl p-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-6">
            <AvatarUpload
              currentUrl={profile.user.avatar_url}
              userName={profile.user.name}
              onUpload={handleUpload}
              isUploading={isUploading}
            />
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-primary">{profile.user.name}</h1>
              <p className="text-text-muted text-sm mt-1">
                Member since {new Date(profile.user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <div className="text-text-muted text-xs uppercase tracking-widest mb-1">Total Score</div>
              <ScoreDisplay value={profile.user.total_score} className="text-4xl text-neon-cyan" />
            </div>
            {bestRank !== null && (
              <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-neon-amber text-sm font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                Global Rank #{bestRank}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2 - Game Stats Grid */}
        <section>
          <h2 className="text-xl font-bold tracking-widest mb-6">GAME STATS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dojo 3D Card */}
            <GlassCard
              ref={(el) => (cardsRef.current[0] = el)}
              className="border-t-2 border-t-neon-amber flex flex-col justify-between h-full"
            >
              <div>
                <h3 className="text-sm uppercase tracking-widest text-text-muted mb-4">Dojo 3D</h3>
                {profile.stats['dojo-3d'] ? (
                  <div className="flex flex-wrap gap-3 mb-6">
                    <StatBadge label="Best Score" value={profile.stats['dojo-3d'].best_score} color="amber" animated />
                    <StatBadge label="Best Wave" value={profile.stats['dojo-3d'].best_wave || 0} color="purple" animated />
                    <StatBadge label="Sessions" value={profile.stats['dojo-3d'].total_sessions} color="cyan" animated />
                  </div>
                ) : (
                  <div className="py-8 text-center text-text-muted text-sm">Not played yet</div>
                )}
              </div>
              <div className="mt-auto flex justify-center">
                <NeonButton variant="ghost" onClick={() => navigate('/play/dojo-3d')} className="w-full">
                  Play Dojo 3D
                </NeonButton>
              </div>
            </GlassCard>

            {/* Card Battler Card */}
            <GlassCard
              ref={(el) => (cardsRef.current[1] = el)}
              className="border-t-2 border-t-neon-teal flex flex-col justify-between h-full"
            >
              <div>
                <h3 className="text-sm uppercase tracking-widest text-text-muted mb-4">Card Battler</h3>
                {profile.stats['card-battler'] ? (
                  <div className="flex flex-wrap gap-3 mb-6">
                    <StatBadge label="Best Score" value={profile.stats['card-battler'].best_score} color="amber" animated />
                    <StatBadge label="Best Turns" value={profile.stats['card-battler'].best_turns || 0} color="purple" animated />
                    <StatBadge label="Sessions" value={profile.stats['card-battler'].total_sessions} color="cyan" animated />
                  </div>
                ) : (
                  <div className="py-8 text-center text-text-muted text-sm">Not played yet</div>
                )}
              </div>
              <div className="mt-auto flex justify-center">
                <NeonButton variant="ghost" onClick={() => navigate('/play/card-battler')} className="w-full">
                  Play Card Battler
                </NeonButton>
              </div>
            </GlassCard>

            {/* Cyber Runner Card */}
            <GlassCard
              ref={(el) => (cardsRef.current[2] = el)}
              className="border-t-2 border-t-neon-cyan flex flex-col justify-between h-full"
            >
              <div>
                <h3 className="text-sm uppercase tracking-widest text-text-muted mb-4">Cyber Runner</h3>
                {profile.stats['cyber-runner'] ? (
                  <div className="flex flex-wrap gap-3 mb-6">
                    <StatBadge label="Best Dist" value={`${profile.stats['cyber-runner'].best_distance || 0}m`} color="cyan" />
                    <StatBadge label="Peak Spd" value={profile.stats['cyber-runner'].best_speed || 0} color="amber" animated />
                    <StatBadge label="Sessions" value={profile.stats['cyber-runner'].total_sessions} color="purple" animated />
                  </div>
                ) : (
                  <div className="py-8 text-center text-text-muted text-sm">Not played yet</div>
                )}
              </div>
              <div className="mt-auto flex justify-center">
                <NeonButton variant="ghost" onClick={() => navigate('/play/cyber-runner')} className="w-full">
                  Play Cyber Runner
                </NeonButton>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* SECTION 3 - Session History */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold tracking-widest text-primary">SESSION HISTORY</h2>
            
            <div className="relative flex gap-2 bg-bg-secondary p-1 rounded-lg border border-border-glass max-w-fit">
              {tabs.map((tab) => {
                const isActive = selectedGame === tab.id
                return (
                  <button
                    key={tab.id || 'all'}
                    onClick={() => setSelectedGame(tab.id)}
                    className={`relative px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${
                      isActive ? 'text-neon-cyan' : 'text-text-muted hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-glass border border-neon-cyan/30 rounded-md shadow-[0_0_10px_rgba(0,245,255,0.1)] -z-10" />
                    )}
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <SessionHistoryTable
            sessions={sessions}
            isLoading={isLoadingSessions}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </section>
      </main>
    </div>
  )
}
