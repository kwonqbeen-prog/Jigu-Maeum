import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import BottomTabBar from './components/common/BottomTabBar'
import SplashScreen from './screens/SplashScreen'
import LandingScreen from './screens/LandingScreen'
import AuthScreen from './screens/AuthScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import ServiceIntroCarouselScreen from './screens/onboarding/ServiceIntroCarouselScreen'
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
import CoachmarkTour from './components/common/CoachmarkTour'
import Sidebar from './components/common/Sidebar'
import { markOnboardingCompleted, markCoachmarkSeen, getTodayIncompleteMissionCount, hasNewRecordsSince } from './data/storage'

const RECORDS_LAST_SEEN_KEY = 'climatemood:records-last-seen-at'

function AuthenticatedApp({ auth, justSignedUp }) {
  const { profile, loading: profileLoading, error: profileError, refresh: refreshProfile, save: saveProfile } = useProfile(auth.user.id)
  const [screen, setScreen] = useState('splash')
  const [activeTab, setActiveTab] = useState('planet')
  const [mountedTabs, setMountedTabs] = useState(() => new Set(['planet']))
  const [logoutWithdrawMode, setLogoutWithdrawMode] = useState(null)
  const bootstrappedRef = useRef(false)
  const scrollPositionsRef = useRef({ planet: 0, missions: 0, records: 0 })
  const activeTabRef = useRef(activeTab)
  activeTabRef.current = activeTab
  const recordsLastSeenRef = useRef(localStorage.getItem(RECORDS_LAST_SEEN_KEY) ?? new Date(0).toISOString())
  const [incompleteMissionCount, setIncompleteMissionCount] = useState(0)
  const [hasNewRecords, setHasNewRecords] = useState(false)
  const [tourRun, setTourRun] = useState(false)
  const [coachmarkReplayRequested, setCoachmarkReplayRequested] = useState(false)
  const autoTourTriggeredRef = useRef(false)
  const showToast = useToast()

  // 최초 가입 후 홈 탭에 도착하면 코치마크 투어를 자동으로 한 번 띄운다
  useEffect(() => {
    if (autoTourTriggeredRef.current) return
    if (screen !== 'main' || activeTab !== 'planet') return
    if (!profile || profile.coachmark_seen_at) return
    autoTourTriggeredRef.current = true
    setTourRun(true)
  }, [screen, activeTab, profile])

  // 설정 > 안내 다시 보기 — 홈 탭으로 돌아온 뒤(대상 요소가 화면에 있어야 함) 투어를 시작한다
  useEffect(() => {
    if (!coachmarkReplayRequested) return
    if (screen !== 'main' || activeTab !== 'planet') return
    setCoachmarkReplayRequested(false)
    setTourRun(true)
  }, [coachmarkReplayRequested, screen, activeTab])

  const handleTourFinish = async () => {
    setTourRun(false)
    try {
      await markCoachmarkSeen()
      await refreshProfile()
    } catch {
      // 안내 완료 표시 실패는 무시 — 설정에서 언제든 다시 볼 수 있다
    }
  }

  useEffect(() => {
    setMountedTabs((prev) => (prev.has(activeTab) ? prev : new Set(prev).add(activeTab)))
  }, [activeTab])

  const refreshMissionsBadge = useCallback(async () => {
    try {
      setIncompleteMissionCount(await getTodayIncompleteMissionCount())
    } catch {
      // 배지 계산 실패는 핵심 기능이 아니므로 조용히 무시한다
    }
  }, [])

  const refreshRecordsBadge = useCallback(async () => {
    try {
      setHasNewRecords(await hasNewRecordsSince(recordsLastSeenRef.current))
    } catch {
      // 배지 계산 실패는 핵심 기능이 아니므로 조용히 무시한다
    }
  }, [])

  // 기록 탭을 열면 "새 기록 있음" 배지를 즉시 지우고, 이후 기준 시각을 갱신한다
  useEffect(() => {
    if (activeTab !== 'records') return
    setHasNewRecords(false)
    const now = new Date().toISOString()
    recordsLastSeenRef.current = now
    localStorage.setItem(RECORDS_LAST_SEEN_KEY, now)
  }, [activeTab])

  // main 화면에 들어올 때(탭 전환 포함)마다 두 배지를 최신 상태로 맞춘다
  useEffect(() => {
    if (screen !== 'main') return
    refreshMissionsBadge()
    refreshRecordsBadge()
  }, [screen, activeTab, refreshMissionsBadge, refreshRecordsBadge])

  // 탭 전환 시 스크롤 위치를 탭별로 기억해 복원한다 — 전체 페이지가 하나의
  // window 스크롤을 공유하므로, 활성 탭이 바뀔 때마다 해당 탭이 마지막으로
  // 있던 위치로 되돌려준다.
  useEffect(() => {
    if (screen !== 'main') return undefined
    const onScroll = () => {
      scrollPositionsRef.current[activeTabRef.current] = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [screen])

  useLayoutEffect(() => {
    if (screen !== 'main') return
    window.scrollTo(0, scrollPositionsRef.current[activeTab] ?? 0)
  }, [screen, activeTab])

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
    // TODO(온보딩 재구성 작업): 가입 전 ServiceIntroCarouselScreen 4번 슬라이드가 이제
    // 같은 안전 고지를 담당하므로, 온보딩 재구성 시 이 스텝은 제거 대상(작업지시서 §5, §7)
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
          onOpenCoachmark={() => {
            setCoachmarkReplayRequested(true)
            goHome()
          }}
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
  // 탭은 한 번 방문하면 언마운트하지 않고 display:none으로만 숨긴다 —
  // 그래야 탭 내부 상태(스크롤, 입력 중인 값, 열려 있던 시트 등)가 유지된다.
  // lg(1024px)+ 데스크탑에서는 BottomTabBar 대신 Sidebar가 같은 activeTab 상태를 공유하며
  // 좌측에 고정 표시된다(sticky) — 문서 스크롤은 그대로 window가 담당하므로 AppBar의
  // scroll 리스너나 탭별 스크롤 위치 복원 로직은 손댈 필요가 없다.
  const tabBadges = {
    missions: incompleteMissionCount > 0 ? incompleteMissionCount : undefined,
    records: hasNewRecords ? true : undefined,
  }
  return (
    <div className="flex min-h-svh flex-col bg-surface lg:flex-row">
      <Sidebar active={activeTab} onChange={setActiveTab} onOpenSettings={() => setScreen('settings-home')} badges={tabBadges} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1">
          {mountedTabs.has('planet') && (
            <div className={activeTab === 'planet' ? undefined : 'hidden'}>
              <HomeScreen
                isActive={activeTab === 'planet'}
                onStartCheckin={() => setScreen('checkin')}
                onGoMissions={() => setActiveTab('missions')}
                onOpenSettings={() => setScreen('settings-home')}
                onOpenArchive={() => setScreen('archive')}
              />
            </div>
          )}
          {mountedTabs.has('missions') && (
            <div className={activeTab === 'missions' ? undefined : 'hidden'}>
              <TodayMissionsScreen
                isActive={activeTab === 'missions'}
                onOpenSettings={() => setScreen('settings-home')}
                onStartCheckin={() => setScreen('checkin')}
                onOpenArchive={() => setScreen('archive')}
                onMissionsChanged={() => {
                  refreshMissionsBadge()
                  refreshRecordsBadge()
                }}
              />
            </div>
          )}
          {mountedTabs.has('records') && (
            <div className={activeTab === 'records' ? undefined : 'hidden'}>
              <RecordsHomeScreen
                isActive={activeTab === 'records'}
                onOpenSettings={() => setScreen('settings-home')}
                onOpenHistory={() => setScreen('history')}
                onOpenStreak={() => setScreen('records-streak')}
                onOpenArchive={() => setScreen('archive')}
              />
            </div>
          )}
        </div>
        <BottomTabBar active={activeTab} onChange={setActiveTab} badges={tabBadges} />
      </div>
      <CoachmarkTour run={tourRun} onFinish={handleTourFinish} />
    </div>
  )
}

function AppInner({ auth }) {
  const justSignedUpRef = useRef(false)
  // 'landing' | 'carousel' | 'auth-login' | 'auth-signup' | 'reset-password'
  const [preAuthScreen, setPreAuthScreen] = useState('landing')
  const wasLoadingRef = useRef(true)
  const [sessionRestored, setSessionRestored] = useState(false)
  const [welcomeDone, setWelcomeDone] = useState(false)

  // 세션 확인(auth.loading)이 막 끝났는데 이미 로그인된 상태라면 "돌아오신 걸 환영해요"를
  // 잠깐 보여줄 대상으로 표시한다 — 로그인 폼을 직접 제출한 경우(항상 loading이 false인
  // 상태에서 일어남)는 이 조건에 안 걸려서 환영 문구 없이 바로 이어진다
  useEffect(() => {
    if (wasLoadingRef.current && !auth.loading && auth.user) {
      setSessionRestored(true)
    }
    wasLoadingRef.current = auth.loading
  }, [auth.loading, auth.user])

  useEffect(() => {
    if (!sessionRestored) return undefined
    const timer = setTimeout(() => setWelcomeDone(true), 900)
    return () => clearTimeout(timer)
  }, [sessionRestored])

  if (auth.loading) {
    return <SplashScreen />
  }

  if (auth.user && sessionRestored && !welcomeDone) {
    return <SplashScreen welcome displayName={auth.user.user_metadata?.display_name} />
  }

  if (!auth.user) {
    // AuthScreen/ResetPasswordScreen은 내부를 건드리지 않고 그대로 재사용하므로(작업지시서
    // §7), 이 시점의 실제 data-theme가 dark/고대비여도 항상 라이트로 보이도록 바깥에서
    // .pre-auth-light로 감싼다 — LandingScreen/ServiceIntroCarouselScreen은 자체적으로도
    // 이 클래스를 갖고 있어 중복되지만 무해하다
    let content
    if (preAuthScreen === 'reset-password') {
      content = <ResetPasswordScreen auth={auth} onBack={() => setPreAuthScreen('auth-login')} />
    } else if (preAuthScreen === 'carousel') {
      content = <ServiceIntroCarouselScreen onComplete={() => setPreAuthScreen('auth-signup')} />
    } else if (preAuthScreen === 'auth-login' || preAuthScreen === 'auth-signup') {
      content = (
        <AuthScreen
          auth={auth}
          initialMode={preAuthScreen === 'auth-signup' ? 'signup' : 'login'}
          onForgotPassword={() => setPreAuthScreen('reset-password')}
          onSignupSuccess={() => {
            justSignedUpRef.current = true
          }}
        />
      )
    } else {
      content = (
        <LandingScreen
          onSignup={() => setPreAuthScreen('carousel')}
          onLogin={() => setPreAuthScreen('auth-login')}
        />
      )
    }
    return <div className="pre-auth-light">{content}</div>
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
