// C-13 ListBlock — 흰 배경 하나 + 옅은 회색 구분선으로 묶는 리스트 컨테이너.
// MissionCard 등 행(row) 컴포넌트를 감싸는 용도로 쓴다.
export default function ListBlock({ children }) {
  return <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">{children}</div>
}
