import { useEffect, useState } from 'react'

const FONT_SPEC = '24px "Material Symbols Rounded"'

// Material Symbols는 index.html에서 <link>로 불러오는 웹폰트라, 폰트가 아직 로드되기
// 전(느린 네트워크 등) 타이밍에 아이콘을 렌더링하면 font-display: swap 폴백으로 리거처
// 문자열("progress_activity" 등)이 그대로 텍스트로 노출된다 — 특히 회전 스피너에 걸리면
// 텍스트가 빙글빙글 도는 것처럼 보여 눈에 띄게 어색하다(과거 SplashScreen/ScreenFallback에서
// 개별적으로 스피너를 없애 우회했던 문제의 근본 원인). 여기서 한 번에 막는다: 폰트 로드가
// 확인되기 전까지는 아이콘을 visibility:hidden으로 숨겨(레이아웃 공간은 유지) 리거처
// 텍스트가 보이는 순간 자체를 없앤다.
let materialFontReady = typeof document !== 'undefined' && Boolean(document.fonts?.check(FONT_SPEC))
let materialFontLoadPromise = null

function waitForMaterialFont() {
  if (materialFontReady) return Promise.resolve()
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve()
  if (!materialFontLoadPromise) {
    // document.fonts.ready는 아직 요청된 적 없는 폰트는 기다려주지 않으므로, load()로
    // 명시적으로 다운로드를 트리거한다. 실패해도 무한정 숨겨두지 않도록 catch에서도 완료 처리.
    materialFontLoadPromise = document.fonts
      .load(FONT_SPEC)
      .catch(() => {})
      .then(() => document.fonts.ready)
      .catch(() => {})
  }
  return materialFontLoadPromise.then(() => {
    materialFontReady = true
  })
}

export default function Icon({ name, filled = false, className = '' }) {
  const [ready, setReady] = useState(materialFontReady)

  useEffect(() => {
    if (ready) return undefined
    let cancelled = false
    waitForMaterialFont().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [ready])

  return (
    <span
      aria-hidden="true"
      className={`material-symbols-rounded${filled ? ' icon-fill' : ''} ${className}`}
      style={ready ? undefined : { visibility: 'hidden' }}
    >
      {name}
    </span>
  )
}
