# 🌍 지구 마음 (Jigu Maeum)

기후 위기로 인한 불안과 무력감을, 작은 실천과 마음 챙김 대화로 함께 돌보는 **기후 불안 케어 서비스**입니다.

---

## 1. 만든 이유 & 목표

세계보건기구(WHO)는 2024년 "기후 변화와 보건" 결의안을 통해 기후 변화를 "전 지구적 공중보건에 대한 주요 위협"으로 명시했습니다. 기후 위기에 대한 반응으로 불안, 무기력, 죄책감 등의 정신적·감정적 고통을 겪는 현상을 **기후 불안(Climate Anxiety)**이라 부릅니다.

기존 대처 방식들은 대부분 아래와 같은 한계를 가지고 있었습니다.

| 현재 대처 방식 | 한계점 |
| --- | --- |
| 명상 앱, 심리 상담 이용 | 기후 위기라는 '원인'이 계속 실재해 회복에 근본적 한계 |
| 개인 실천 방법을 스스로 찾아서 실행 | 혼자 찾고 지속하는 데 노력이 많이 들어 지속 가능성 낮음 |
| 부정적 뉴스에서 거리 두기(회피) | 완전 차단 불가능 → 재노출 시 스트레스 반복 |
| 무엇을 해야 할지 몰라 방치 | 우울감이 해소되지 않고 오히려 심화 |
| 가해 주체에 대한 분노 | 감정 배출은 되나 문제 해결로 이어지지 않음 |

**지구 마음**은 "감정 케어"와 "행동 실천" 중 하나만 다루던 기존 방식과 달리, 두 가지를 하나의 흐름으로 연결합니다.

- 🌱 **실천 가능한 행동을 통한 자기 효능감 회복** — 일상에서 실천할 수 있는 맞춤형 기후 행동 미션을 제공해 부정적 감정을 해소하고 자기 효능감을 회복하도록 돕습니다.
- 💚 **기후 불안에 특화된 마음 챙김** — 일반 명상 앱과 달리, 기후 불안이라는 특수한 맥락에 최적화된 대화형 마음 챙김을 제공합니다.

**목표**: 기후 위기로 불안·무력감·죄책감을 느끼는 사람이 자기 효능감을 높이고 감정적 안도감을 얻을 수 있도록 돕는 것.

### 타겟 사용자

| 유형 | 감정 상태 |
| --- | --- |
| 불안형 | 악화되는 기후 위기에 불안과 공포를 느낌 |
| 무기력형 | '내가 할 수 있는 것이 없다'는 생각에 무력함을 느낌 |
| 죄책감형 | 자신의 일상 행동이 환경을 파괴하고 있다는 죄책감을 느낌 |
| 정보과잉형 | 자극적이고 부정적인 기후 뉴스에 반복적으로 노출되어 스트레스를 느낌 |

### 사용자 흐름

1. **대화 시작** — 따뜻한 환대 인사와 함께 사용자의 현재 마음 상태에 관심을 갖는 질문으로 대화를 유도
2. **정보 수집** — 대화를 통해 감정 상태(불안/무기력/죄책감/정보과잉)와 에너지 레벨(실천 의지)을 파악
3. **미션 제공** — 파악한 정보를 바탕으로 사용자에게 맞는 1~5개의 미션을 생성
4. **미션 달성** — 하루 동안 미션을 실천하고 달성 여부를 체크, 완료 시 격려 메시지와 대시보드로 성장을 시각화

> 본 프로젝트는 [리부트 AI 활용대회](https://app.notion.com/p/AI-39d64318149380008afbd3ecb2cafd62?pvs=21) 출품작입니다.

---

## 2. 사용한 기술

| 구분 | 내용 |
| --- | --- |
| 언어 / 런타임 | JavaScript (React 19), Node.js 20 |
| 프레임워크 / 빌드 | [Vite](https://vitejs.dev/), [React](https://react.dev/) |
| 스타일링 | [Tailwind CSS](https://tailwindcss.com/), Pretendard |
| 백엔드 (BaaS) | [Supabase](https://supabase.com/) — Auth(이메일/카카오 로그인), Database(RLS), Edge Functions |
| AI 모델 | [Upstage Solar API](https://console.upstage.ai/) — Supabase Edge Function(`solar-proxy`)을 경유해 호출 (API 키 미노출) |
| 온보딩 UX | [react-joyride](https://github.com/gilbarbara/react-joyride) |
| 린트 | [oxlint](https://oxc.rs/) |
| 배포 | GitHub Actions → GitHub Pages |

---

## 3. 실행 방법

### 사전 준비물

- Node.js 20 이상
- Supabase 프로젝트 (Auth + DB + Edge Function 배포용)

### 설치 및 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일에 Supabase URL / anon key 입력

# 3. 개발 서버 실행
npm run dev
```

### 그 외 명령어

```bash
npm run build     # 프로덕션 빌드 (dist 폴더 생성)
npm run preview   # 빌드 결과 로컬 미리보기
npm run lint      # oxlint 실행
```

### 백엔드(Supabase) 설정

로그인, DB, Solar API 프록시(Edge Function) 설정은 별도 문서로 정리되어 있습니다.
👉 [SETUP_AUTH_BACKEND.md](./SETUP_AUTH_BACKEND.md) 참고

### 배포

`main` 브랜치에 push되면 GitHub Actions가 자동으로 빌드 후 GitHub Pages에 배포합니다. (`.github/workflows/deploy.yml`)

---

## 4. 프로젝트 구조

```
src/
├── api/           # 외부 API 클라이언트 (Solar 프록시 등)
├── components/    # 공통 UI 컴포넌트
├── contexts/      # Theme, Toast 등 전역 Context
├── data/          # 미션 풀, 상수, 로컬 스토리지 유틸
├── hooks/         # 인증/프로필/미션 생성 커스텀 훅
├── lib/           # Supabase 클라이언트 초기화
├── prompts/       # Solar 시스템 프롬프트
└── screens/       # 온보딩/홈/체크인/미션/기록/설정 화면
supabase/
├── functions/     # Edge Functions (solar-proxy, delete-account)
└── schema.sql     # DB 스키마 및 RLS 정책
```

---

## 5. 참고 문서

- [SETUP_AUTH_BACKEND.md](./SETUP_AUTH_BACKEND.md) — Supabase 로그인/DB/Edge Function 설정 가이드
- [THEME_DESIGN_GUIDE.md](./THEME_DESIGN_GUIDE.md) — 디자인 시스템 가이드
