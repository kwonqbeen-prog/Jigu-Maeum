import { flushSync } from 'react-dom'

// 화면 전환(screen/tab 변경)을 View Transitions API로 감싸 부드러운 크로스페이드를
// 적용한다. 미지원 브라우저(Firefox 등)나 "움직임 줄이기" 설정 시에는 즉시 전환되는
// 기존 동작 그대로 폴백한다 — index.css의 [data-motion='reduced'] 정책과 동일한 기준.
export function navigateWithTransition(update) {
  const reduced = document.documentElement.getAttribute('data-motion') === 'reduced'
  if (reduced || typeof document.startViewTransition !== 'function') {
    update()
    return
  }
  document.startViewTransition(() => flushSync(update))
}
