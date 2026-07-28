import AppBar from '../../components/common/AppBar'
import logo from '../../assets/planet-mascot/logo.svg'

function Section({ label, children }) {
  return (
    <section className="space-y-2">
      <p className="text-[13px] font-medium text-ink-muted">{label}</p>
      <div className="space-y-2 rounded-2xl bg-surface-alt p-4 text-[14px] leading-relaxed text-ink">{children}</div>
    </section>
  )
}

// S-60 "서비스 안내" — 기획의도·기술·향후 계획을 담은 About 화면
export default function ServiceInfoScreen({ onBack }) {
  return (
    <div className="flex min-h-svh flex-col bg-surface lg:mx-auto lg:max-w-[480px]">
      <AppBar title="서비스 안내" leading="back" onLeadingClick={onBack} />
      <div className="flex-1 space-y-6 px-4 py-6">
        <div className="flex justify-center">
          <img src={logo} alt="" aria-hidden="true" className="h-16 w-16" />
        </div>

        <div className="px-2">
          <p className="text-[15px] font-medium text-ink">
            지구 마음은 기후 위기로 인한 불안과 무력감을, 매일 주어지는 일상 속 작은 실천으로 돌보는 서비스예요.
          </p>
        </div>

        <Section label="왜 만들게 되었나요?">
          <p>
            기후 뉴스를 볼 때마다 불안하거나, 무기력하거나, 나만 뭔가 잘못하고 있는 것 같은 죄책감이 든 적 있으신가요?
            혼자 명상 앱을 켜보거나 실천 방법을 찾아봐도, 기후 위기라는 원인 자체는 그대로 있으니 마음이 쉽게 나아지지
            않았어요.
          </p>
          <p>
            그래서 지구 마음은 감정을 다독이는 것과 직접 행동해보는 것, 둘 중 하나만 고르지 않기로 했어요. 오늘의
            마음 상태에 맞는 작은 실천을 통해 &ldquo;나도 뭔가 할 수 있다&rdquo;는 감각을 되찾을 수 있도록 돕는 게
            지구 마음의 시작이었어요.
          </p>
        </Section>

        <Section label="어떻게 써야 하나요?">
          <p>
            매일 미션 만들기에서 알려주신 감정과 오늘의 의욕, 그동안의 실천 이력을 바탕으로 AI(Upstage Solar)가 지금
            당신에게 맞는 미션을 새로 만들어드려요. 오늘 의욕이 얼마나 있는지에 따라 미션은 1개부터 5개까지 달라져요
            — 가볍게 하나만 해보고 싶은 날도, 여러 개에 도전하고 싶은 날도 모두 괜찮아요. 같은 기분이어도 어제와
            똑같은 제안을 받지 않도록, 최근에 해본 실천과 겹치지 않게 매번 다시 생각해서 골라요.
          </p>
          <p>
            실천을 쌓아갈수록 마음 지구가 막 태어난 지구에서 빛나는 지구까지 함께 자라나요. 회원 정보와 실천 기록은
            안전하게 저장(Supabase)되어, 다른 기기에서도 이어서 확인할 수 있어요.
          </p>
        </Section>

        <Section label="앞으로의 계획">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-ink">개인화 고도화</p>
              <p className="mt-0.5 text-ink-muted">
                대화와 실천 이력을 더 깊이 이해해서, 지금 당신에게 더 꼭 맞는 미션을 추천할게요.
              </p>
            </div>
            <div>
              <p className="font-medium text-ink">커뮤니티 확장</p>
              <p className="mt-0.5 text-ink-muted">
                같은 마음을 가진 사람들과 익명으로 공감하고, 함께 실천을 이어갈 수 있게 할게요.
              </p>
            </div>
            <div>
              <p className="font-medium text-ink">리포트 강화</p>
              <p className="mt-0.5 text-ink-muted">
                주간·월간 리포트로 감정과 실천의 흐름을 한눈에 돌아볼 수 있게 할게요.
              </p>
            </div>
          </div>
        </Section>

        <div className="px-2 pt-2">
          <p className="text-ink-muted">버전 0.1.0</p>
        </div>
      </div>
    </div>
  )
}
