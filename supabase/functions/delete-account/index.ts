// Supabase Edge Function: delete-account
// 역할: 회원 탈퇴 시 사용자 소유 데이터(6개 테이블) + auth.users 계정을 서비스 롤로 한 번에
// 삭제합니다. 예전엔 클라이언트가 데이터를 먼저 지우고 이 함수로 계정만 지웠는데, 계정
// 삭제 단계가 실패하면(배포 문제·네트워크 등) 데이터는 이미 사라졌는데 로그인 계정만
// 남는 어중간한 상태가 됐습니다. 이제 이 함수 하나가 둘 다 담당해서, 실패해도 둘 다
// 그대로 남아 재시도가 안전하고 성공하면 둘 다 지워집니다.
//
// 배포 방법: (Supabase CLI 로그인이 안 되는 환경이면) 대시보드 Edge Functions >
// delete-account > Via Editor에 이 파일 내용을 그대로 붙여넣고 Deploy.
//
// 호출 순서(클라이언트): 이 함수 하나만 호출 → 성공하면 auth.signOut()만 하면 됨
// (src/data/storage.js의 deleteAccount() 참고).
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

// src/data/storage.js에 있던 deleteAllUserData()와 동일한 테이블 목록 —
// 새 테이블이 추가되면 이쪽도 같이 갱신할 것
const USER_DATA_TABLES = ['missions', 'checkins', 'reflections', 'achievements', 'user_memories', 'user_profiles']

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
    const userId = userData.user.id

    // 데이터부터 지운다(서비스 롤이라 RLS 무관하게 확실히 지워짐) — 계정 삭제가 실패해도
    // 데이터만 사라지고 계정이 남는 일이 없도록, 여기서 실패하면 계정 삭제를 시도하지 않고
    // 바로 에러를 반환해 재시도 가능한 상태로 둔다
    for (const table of USER_DATA_TABLES) {
      const { error: dataError } = await adminClient.from(table).delete().eq('user_id', userId)
      if (dataError) {
        return new Response(JSON.stringify({ error: `데이터 삭제 실패(${table}): ${dataError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
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
