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

**지구 마음**은 "감정 케어"와 "행동 실천" 중 하나만 다루던 기존 방식과 달리, 두 가지를 하나의 흐름으로 연결합니다.

- 🌱 **실천 가능한 행동을 통한 자기 효능감 회복** — 일상에서 실천할 수 있는 맞춤형 기후 행동 미션을 제공해 부정적 감정을 해소하고 자기 효능감을 회복하도록 돕습니다.
- 💚 **기후 불안에 특화된 마음 챙김** — 일반 명상 앱과 달리, 기후 불안이라는 특수한 맥락에 최적화된 마음 챙김을 제공합니다.

**목표**: 기후 위기로 불안·무력감·죄책감을 느끼는 사람이 자기 효능감을 높이고 감정적 안도감을 얻을 수 있도록 돕는 것.

### 타겟 사용자

| 유형 | 감정 상태 |
| --- | --- |
| 불안형 | 악화되는 기후 위기에 불안과 공포를 느낌 |
| 무기력형 | '내가 할 수 있는 것이 없다'는 생각에 무력함을 느낌 |
| 죄책감형 | 자신의 일상 행동이 환경을 파괴하고 있다는 죄책감을 느낌 |
| 정보과잉형 | 자극적이고 부정적인 기후 뉴스에 반복적으로 노출되어 스트레스를 느낌 |

> 본 프로젝트는 [리부트 AI 활용대회](https://app.notion.com/p/AI-39d64318149380008afbd3ecb2cafd62?pvs=21) 출품작입니다.

---

## 2. 핵심 기능

### 1) Solar LLM 기반 맞춤 미션 생성

체크인(감정/의욕/장소/자유 입력)과 사용자 프로필(대처 방식, 사회적 활동 선호, 관심 분야), 최근 14일 이력을 바탕으로 Upstage **Solar LLM**이 매번 3개의 맞춤형 기후 행동 미션을 생성합니다.

### 2) 마음 지구(Mind Planet) 성장 시각화 & 동기부여

누적 완료 미션 수에 따라 캐릭터 "마음 지구"가 조용한 지구 → 깨어나는 지구 → 함께 걷는 지구 → 숨쉬는 지구 → 빛나는 지구, 5단계로 성장합니다. 연속 실천일(streak), 업적 배지와 함께 사용자의 꾸준한 실천을 시각적으로 보여주어 지속적인 동기를 부여합니다.

---

## 3. 사용한 기술

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

## 4. AI 모델 & 설계 로직

미션 생성은 **Upstage Solar LLM**이 담당하며, 브라우저가 API 키를 직접 들고 있지 않도록 Supabase Edge Function `solar-proxy`(`supabase/functions/solar-proxy`)를 프록시로 경유합니다. 프론트엔드는 `src/api/solarClient.js`의 `askSolar()`로 이 프록시를 호출하고, 응답에서 코드펜스를 제거해 JSON을 파싱합니다.

### 미션 생성 프롬프트 설계 (`src/prompts/systemPrompts.js`)

Few-shot 예시로 스타일을 흉내 내게 하는 대신, **판단 기준 + 절차 + 금지 규칙**을 명시하는 방식으로 로직을 지시합니다.

- **판단 기준**
  - 유형 균형: `carbon`(생활 속 탄소배출 감축) / `nature`(자연·야외 활동) / `social`(사회적 대화·모임) 중 최근 14일간 가장 적게 제시된 유형을 3개 중 최소 1개 포함
  - 장소 제약: 체크인에서 선택한 장소(집/직장/외출/자연/모름)에 맞는 미션만 허용
  - 난이도 곡선: 누적 완료 수 기반 장기 난이도(`light → normal → challenge`, 10개마다 상승)를 오늘의 의욕(에너지 레벨)으로 단기 보정
  - 사회적 배려: 사회적 활동을 기피하는 사용자에게는 `social` 유형을 최대 1개, 난이도는 `light`로 고정
  - 관심 분야 반영 및 최근 14일 이력과의 중복 방지
- **절차**: 유형/난이도 슬롯 결정 → 구체적 행동 작성 → 예상 소요 시간 산정 → 미션별 추천 이유(`why`) 작성 → 전체 소개 메시지(`bundle_message`) 작성
- **금지 규칙**: 내부 유형명 노출 금지, 감정 단정 표현("무기력하시군요" 등) 금지, 수치·연구 인용 금지, 훈계·죄책감 자극 금지
- 응답은 코드펜스 없는 순수 JSON만 반환하도록 강제 (`missions` 정확히 3개)

### 안정성 확보 로직 (`src/hooks/useMissionGeneration.js`)

- 생성된 미션 제목이 최근 이력과 자카드 유사도(문자 단위) 0.7 이상으로 겹치면, 재생성 사유를 프롬프트에 덧붙여 한 번 더 요청
- Solar API 호출이 실패하거나 형식이 어긋나면 로컬 폴백 미션 풀(`src/data/missionPool.js`, 유형당 9개)에서 부족한 유형 순으로 안전하게 대체 제공

### 마음 지구 성장 로직 (`src/components/common/PlanetOrb.jsx`, `src/data/achievementRules.js`)

- 누적 완료 미션 수를 5단계 임계값(0 / 3 / 10 / 25 / 50)과 비교해 마음 지구의 단계·이름·대륙 색상을 결정
- 연속 실천일(streak), 전체 유형 달성 여부, 회고 작성 수 등을 기준으로 업적을 평가해 지구 표면에 장식으로 반영

---

## 5. 실행 방법

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

## 6. 프로젝트 구조

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

## 7. 참고 문서

- [SETUP_AUTH_BACKEND.md](./SETUP_AUTH_BACKEND.md) — Supabase 로그인/DB/Edge Function 설정 가이드
- [THEME_DESIGN_GUIDE.md](./THEME_DESIGN_GUIDE.md) — 디자인 시스템 가이드
