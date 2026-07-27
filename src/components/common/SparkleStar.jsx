// 둥근 네 방향 반짝임(sparkle) 장식 — clip-path 폴리곤(직선 8각형, 표창처럼 모서리가
// 뾰족했음) 대신 곡선 SVG path로 그려서 끝이 뭉툭하고 부드러운 별 모양으로 만든다.
// currentColor를 쓰므로 부모/자신의 style.color로 색을 넘긴다
export default function SparkleStar({ style, className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <path
        d="M50,2 C56,40 60,44 98,50 C60,56 56,60 50,98 C44,60 40,56 2,50 C40,44 44,40 50,2 Z"
        fill="currentColor"
      />
    </svg>
  )
}
