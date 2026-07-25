import { useCallback, useEffect, useState } from 'react'
import { getUserProfile, upsertUserProfile } from '../data/storage'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getUserProfile()
      setProfile(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const save = useCallback(async (partial) => {
    const data = await upsertUserProfile(partial)
    setProfile(data)
    return data
  }, [])

  return { profile, loading, error, refresh, save }
}
