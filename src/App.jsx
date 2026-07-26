import { useEffect, useRef, useState } from 'react'
import Icon from './components/Icon'
import BottomTabBar from './components/common/BottomTabBar'
import SplashScreen from './screens/SplashScreen'
import AuthScreen from './screens/AuthScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import ThemeModeScreen from './screens/onboarding/ThemeModeScreen'
import NicknameScreen from './screens/onboarding/NicknameScreen'
import ProfileFlowScreen from './screens/onboarding/ProfileFlowScreen'
import SafetyNoticeScreen from './screens/onboarding/SafetyNoticeScreen'
import SupportScreen from './screens/SupportScreen'
import HomeScreen from './screens/home/HomeScreen'
import TodayMissionsScreen from './screens/missions/TodayMissionsScreen'
import MissionArchiveScreen from './screens/missions/MissionArchiveScreen'
import RecordsHomeScreen from './screens/records/RecordsHomeScreen'
import HistoryScreen from './screens/records/HistoryScreen'
import StreakCalendarScreen from './screens/records/StreakCalendarScreen'
import CheckinFlowScreen from './screens/checkin/CheckinFlowScreen'
import SettingsHomeScreen from './screens/settings/SettingsHomeScreen'
import DisplayAccessibilityScreen from './screens/settings/DisplayAccessibilityScreen'
import AccountScreen from './screens/settings/AccountScreen'
import ProfileEditScreen from './screens/settings/ProfileEditScreen'
import ServiceInfoScreen from './screens/settings/ServiceInfoScreen'
import LogoutWithdrawDialog from './screens/settings/LogoutWithdrawDialog'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider, useToast } from './contexts/ToastContext'
import { markOnboardingCompleted } from './data/storage'

function AuthenticatedApp({ auth, justSignedUp }) {
  const { profile, loading: profileLoading, error: profileError, refresh: refreshProfile, save: saveProfile } = useProfile(auth.user.id)
  const [screen, setScreen] = useState('splash')
  const [activeTab, setActiveTab] = useState('planet')
  const [logoutWithdrawMode, setLogoutWithdrawMode] = useState(null)
  const bootstrappedRef = useRef(false)
  const showToast = useToast()

  useEffect(() => {
    if (profileLoading || profileError || bootstrappedRef.current) return
    bootstrappedRef.current = true
    const displayName = auth.user?.user_metadata?.display_name
    if (justSignedUp) {
      setScreen('onb-theme')
    } else if (!displayName) {
      setScreen('onb-nickname')
    } else if (!profile?.onboarding_completed_at) {
      setScreen('onb-profile')
    } else {
      setScreen('main')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading])

  const goHome = () => {
    setScreen('main')
    setActiveTab('planet')
  }
  // 탭 전환 없이 main으로만 복귀 — 여러 탭에서 진입 가능한 화면(미션 보관함 등)의 뒤로가기용
  const goMain = () => setScreen('main')

  if (screen === 'splash') {
    if (profileError) {
      return <SplashScreen error onRetry={refreshProfile} />
    }
    return <SplashScreen />
  }

  if (screen === 'onb-theme') {
    return <ThemeModeScreen onNext={() => setScreen('onb-nickname')} />
  }

  if (screen === 'onb-nickname') {
    return <NicknameScreen auth={auth} onNext={() => setScreen('onb-profile')} showStepProgress={false} />
  }

  if (screen === 'onb-profile') {
    return (
      <ProfileFlowScreen
        onBack={() => setScreen('onb-nickname')}
        onNext={async (data) => {
          try {
            await saveProfile(data)
            setScreen('onb-safety')
          } catch {
            showToast('저장하지 못했어요. 다시 시도해 주세요')
          }
        }}
      />
    )
  }

  if (screen === 'onb-safety') {
    return (
      <SafetyNoticeScreen
        onPreviewSupport={() => setScreen('onb-safety-support')}
        onConfirm={async () => {
          try {
            await markOnboardingCompleted()
            await refreshProfile()
            goHome()
          } catch {
            showToast('저장하지 못했어요. 다시 시도해 주세요')
          }
        }}
      />
    )
  }

  if (screen === 'onb-safety-support') {
    return <SupportScreen readOnly onBack={() => setScreen('onb-safety')} />
  }

  if (screen === 'checkin') {
    return (
      <CheckinFlowScreen
        profile={{ ...profile, displayName: auth.user?.user_metadata?.display_name }}
        onClose={goHome}
        onGoToMissions={() => {
          setScreen('main')
          setActiveTab('missions')
        }}
        onMissionsSaved={() => {
          showToast('미션을 담았어요')
          setScreen('main')
          setActiveTab('missions')
        }}
      />
    )
  }

  if (screen === 'archive') {
    return <MissionArchiveScreen onBack={goMain} onStartCheckin={() => setScreen('checkin')} />
  }

  if (screen === 'history') {
    return (
      <HistoryScreen
        onBack={() => {
          setScreen('main')
          setActiveTab('records')
        }}
        onStartCheckin={() => setScreen('checkin')}
      />
    )
  }

  if (screen === 'records-streak') {
    return (
      <StreakCalendarScreen
        onBack={() => {
          setScreen('main')
          setActiveTab('records')
        }}
      />
    )
  }

  if (screen === 'settings-home') {
    return (
      <>
        <SettingsHomeScreen
          onBack={goHome}
          onOpenDisplay={() => setScreen('settings-display')}
          onOpenAccount={() => setScreen('settings-account')}
          onOpenProfile={() => setScreen('settings-profile')}
          onOpenCoachmark={() => showToast('안내 다시 보기는 준비 중이에요')}
          onOpenSupport={(kind) => setScreen(kind === 'help' ? 'settings-support' : 'settings-about')}
          onOpenLogoutWithdraw={(mode) => setLogoutWithdrawMode(mode)}
        />
        {logoutWithdrawMode && (
          <LogoutWithdrawDialog
            mode={logoutWithdrawMode}
            auth={auth}
            onClose={() => setLogoutWithdrawMode(null)}
          />
        )}
      </>
    )
  }

  if (screen === 'settings-display') {
    return <DisplayAccessibilityScreen onBack={() => setScreen('settings-home')} />
  }

  if (screen === 'settings-account') {
    return (
      <AccountScreen
        auth={auth}
        onBack={() => setScreen('settings-home')}
        onChangePassword={() => setScreen('settings-reset-password')}
      />
    )
  }

  if (screen === 'settings-reset-password') {
    return <ResetPasswordScreen auth={auth} onBack={() => setScreen('settings-account')} />
  }

  if (screen === 'settings-profile') {
    return (
      <ProfileEditScreen
        profile={profile}
        onBack={() => setScreen('settings-home')}
        onSave={async (data) => {
          await saveProfile(data)
        }}
      />
    )
  }

  if (screen === 'settings-support') {
    return <SupportScreen readOnly onBack={() => setScreen('settings-home')} />
  }

  if (screen === 'settings-about') {
    return <ServiceInfoScreen onBack={() => setScreen('settings-home')} />
  }

  // screen === 'main'
  return (
    <div className="flex min-h-svh flex-col bg-surface">
      <div className="flex-1">
        {activeTab === 'planet' && (
          <HomeScreen
            onStartCheckin={() => setScreen('checkin')}
            onGoMissions={() => setActiveTab('missions')}
            onOpenSettings={() => setScreen('settings-home')}
            onOpenArchive={() => setScreen('archive')}
          />
        )}
        {activeTab === 'missions' && (
          <TodayMissionsScreen
            onOpenSettings={() => setScreen('settings-home')}
            onStartCheckin={() => setScreen('checkin')}
            onOpenArchive={() => setScreen('archive')}
          />
        )}
        {activeTab === 'records' && (
          <RecordsHomeScreen
            onOpenSettings={() => setScreen('settings-home')}
            onOpenHistory={() => setScreen('history')}
            onOpenStreak={() => setScreen('records-streak')}
            onOpenArchive={() => setScreen('archive')}
          />
        )}
      </div>
      <BottomTabBar active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

function AppInner({ auth }) {
  const justSignedUpRef = useRef(false)
  const [screen, setScreen] = useState('auth')

  if (auth.loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-surface">
        <Icon name="progress_activity" className="animate-spin text-3xl text-ink-faint" />
      </div>
    )
  }

  if (!auth.user) {
    if (screen === 'reset-password') {
      return <ResetPasswordScreen auth={auth} onBack={() => setScreen('auth')} />
    }
    return (
      <AuthScreen
        auth={auth}
        onForgotPassword={() => setScreen('reset-password')}
        onSignupSuccess={() => {
          justSignedUpRef.current = true
        }}
      />
    )
  }

  return <AuthenticatedApp auth={auth} key={auth.user.id} justSignedUp={justSignedUpRef.current} />
}

function App() {
  const auth = useAuth()
  return (
    <ThemeProvider auth={auth}>
      <ToastProvider>
        <AppInner auth={auth} />
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
