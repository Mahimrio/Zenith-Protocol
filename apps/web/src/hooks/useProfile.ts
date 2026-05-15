import { useState, useEffect, useCallback } from 'react'
import api from '../lib/axios'
import type { AxiosResponse, AxiosError } from 'axios'
import { useAuthStore } from '../store/authStore'
import type { SessionEntry } from '@zenith/ui'

export interface ProfileStats {
  total_sessions: number
  best_score: number
  best_wave?: number
  best_turns?: number
  best_distance?: number
  best_speed?: number
}

export interface ProfileData {
  user: {
    id: string
    name: string
    email: string
    avatar_url: string | null
    total_score: number
    games_played: number
    created_at: string
  }
  stats: {
    'dojo-3d': ProfileStats | null
    'card-battler': ProfileStats | null
    'cyber-runner': ProfileStats | null
  }
  global_ranks: {
    'dojo-3d': number | null
    'card-battler': number | null
    'cyber-runner': number | null
  }
}

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  // Fetch profile stats on mount
  useEffect(() => {
    let cancelled = false
    api.get('/profile')
      .then((res: AxiosResponse<ProfileData>) => {
        if (!cancelled) setProfile(res.data)
      })
      .catch((err: AxiosError) => console.error('Failed to load profile', err))
      .finally(() => {
        if (!cancelled) setIsLoadingProfile(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Fetch sessions when game filter changes
  const loadSessions = useCallback((page = 1, game = selectedGame) => {
    setIsLoadingSessions(true)
    api.get('/profile/sessions', { params: { page, game } })
      .then((res: AxiosResponse<any>) => {
        setSessions(prev => page === 1 ? res.data.data : [...prev, ...res.data.data])
        setHasMore(res.data.meta.current_page < res.data.meta.last_page)
        setCurrentPage(page)
      })
      .catch((err: AxiosError) => console.error('Failed to load sessions', err))
      .finally(() => setIsLoadingSessions(false))
  }, [selectedGame])

  useEffect(() => {
    queueMicrotask(() => loadSessions(1))
  }, [loadSessions])

  const uploadAvatar = async (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    const res = await api.post('/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    // Update authStore user avatar_url
    useAuthStore.getState().fetchMe()
    
    // Also update local profile state
    setProfile(prev => prev ? {
      ...prev,
      user: { ...prev.user, avatar_url: res.data.avatar_url }
    } : null)
    
    return res.data
  }

  return {
    profile,
    sessions,
    isLoadingProfile,
    isLoadingSessions,
    hasMore,
    loadMore: () => loadSessions(currentPage + 1),
    selectedGame,
    setSelectedGame,
    uploadAvatar
  }
}
