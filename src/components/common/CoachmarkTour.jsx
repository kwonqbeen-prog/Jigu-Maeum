import { Joyride, STATUS } from 'react-joyride'

// S-64C · 온보딩 코치마크 투어 — 최초 가입 시 자동 실행, 설정 > 안내 다시 보기로 재실행
const STEPS = [
  {
    target: '[data-tour="planet-orb"]',
    title: '마음 지구',
    content: '매일 체크인할수록 마음 지구가 자라나요. 지금까지의 실천을 한눈에 볼 수 있어요.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="home-cta"]',
    title: '오늘의 마음 체크인',
    content: '지금 마음 상태를 알려주시면 딱 맞는 미션을 추천해드려요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="tab-missions"]',
    title: '미션',
    content: '체크인 후 받은 오늘의 미션은 이 탭에서 확인하고 완료 처리할 수 있어요.',
    placement: 'top',
  },
  {
    target: '[data-tour="tab-records"]',
    title: '마음 기록',
    content: '완료한 미션과 회고, 연속 실천 기록은 여기서 모아볼 수 있어요.',
    placement: 'top',
  },
  {
    target: '[data-tour="settings-icon"]',
    title: '설정',
    content: '이 안내는 설정 > 안내 다시 보기에서 언제든 다시 볼 수 있어요.',
    placement: 'bottom',
  },
]

export default function CoachmarkTour({ run, onFinish }) {
  const handleCallback = (data) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      onFinish()
    }
  }

  return (
    <Joyride
      run={run}
      steps={STEPS}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      callback={handleCallback}
      locale={{ back: '이전', close: '닫기', last: '완료', next: '다음', skip: '건너뛰기' }}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: 'var(--color-ink)',
          textColor: 'var(--color-ink)',
          arrowColor: 'var(--color-surface)',
          backgroundColor: 'var(--color-surface)',
          overlayColor: 'rgba(0, 0, 0, 0.55)',
        },
        tooltip: { borderRadius: 16, fontSize: 14 },
        tooltipTitle: { fontSize: 15, fontWeight: 700 },
        buttonNext: { borderRadius: 999, fontWeight: 700, color: 'var(--color-surface)' },
        buttonBack: { fontWeight: 600 },
      }}
    />
  )
}
