import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signUpWithEmail = useCallback(async (email, password) => {
    setAuthError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setAuthError(error.message)
      return false
    }
    return true
  }, [])

  const updateDisplayName = useCallback(async (displayName) => {
    setAuthError(null)
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } })
    if (error) {
      setAuthError(error.message)
      return { error: error.message }
    }
    return { error: null }
  }, [])

  const updateUserMetadata = useCallback(async (partial) => {
    const { error } = await supabase.auth.updateUser({ data: partial })
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  }, [])

  const signInWithEmail = useCallback(async (email, password) => {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError(error.message)
      return false
    }
    return true
  }, [])

  const signInWithKakao = useCallback(async () => {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    })
    if (error) {
      setAuthError(error.message)
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const sendPasswordReset = useCallback(async (email) => {
    setAuthError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + import.meta.env.BASE_URL,
    })
    if (error) {
      setAuthError(error.message)
      return false
    }
    return true
  }, [])

  const updatePassword = useCallback(async (newPassword) => {
    setAuthError(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setAuthError(error.message)
      return false
    }
    return true
  }, [])

  const clearAuthError = useCallback(() => setAuthError(null), [])

  return {
    session,
    user: session?.user ?? null,
    loading,
    authError,
    signUpWithEmail,
    signInWithEmail,
    signInWithKakao,
    signOut,
    updateDisplayName,
    updateUserMetadata,
    sendPasswordReset,
    updatePassword,
    clearAuthError,
  }
}
