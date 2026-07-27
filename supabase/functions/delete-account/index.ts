// Supabase Edge Function: delete-account
// 역할: 회원 탈퇴 시 auth.users의 계정 자체를 삭제합니다. auth.admin.deleteUser는
// 서비스 롤 권한이 필요해 클라이언트에서 직접 호출할 수 없으므로, 이 함수 안에서만
// 서비스 롤 키를 사용합니다.
//
// 배포 방법:
//   supabase functions deploy delete-account
//
// 호출 순서(클라이언트): 사용자 소유 데이터(missions/checkins/reflections/...) 삭제
// → 이 함수 호출로 auth 계정 삭제 → signOut.
//
// 기본적으로 Supabase는 이 함수 호출 시 Authorization 헤더의 사용자 JWT를
// 검증합니다(로그인하지 않은 사용자는 호출 불가). 대시보드의
// Edge Functions > delete-account > "Enforce JWT Verification" 옵션이 켜져
// 있는지 확인하세요 (기본값 on).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return new Response(
        JSON.stringify({ error: '서버 환경변수(SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY)가 설정되어 있지 않습니다.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: '로그인이 필요합니다.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 호출자 신원은 사용자 JWT로만 확인 — 서비스 롤 키는 삭제 실행에만 쓴다.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userError } = await callerClient.auth.getUser()
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: '유효하지 않은 사용자입니다.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userData.user.id)
    if (deleteError) {
      return new Response(JSON.stringify({ error: `계정 삭제 실패: ${deleteError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
