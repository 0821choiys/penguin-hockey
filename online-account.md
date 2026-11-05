# 펭귄 하키 — 친구 대전 · Google 로그인 · 클라우드 저장 (2026-11-05, v31 · v35)

코드: `v31_net.*` (친구 대전), `v35_acct.*` (계정 · 클라우드 저장), 앱 쪽 `android/…/GoogleAuth.java`.
서버는 Firebase(Authentication + Realtime Database)만 써요. SDK 없이 REST로 불러서 게임 파일이 거의 커지지 않아요.
설정 파일 `firebase-config.json`(빌드 폴더)이 없으면 두 기능 모두 "서버가 아직 연결되지 않았어요"라고만 보여요.
지금 만든 HTML · AAB는 설정 파일 없이 빌드했어요.

## 👥 친구 대전 (경기 모드 → 친구 대전)
- 한 명이 **방 만들기** → 6자리 코드(헷갈리는 0/O/1/I 제외) → 친구가 코드를 입력해 **참가**.
- 3대3 · 2분. 각자 펭귄 1마리를 조종하고 나머지는 AI 팀원이에요.
  - 아이템 · 강화 · 케미 · 이벤트 · 컨디션 · 반칙 판정 · 스킬 컷씬은 없어요. 양쪽 골키퍼는 같은 종류예요.
  - 티어 점수에는 반영되지 않아요. 결과 포인트는 보통 경기처럼 받아요.
- 방 만든 사람의 기기가 경기를 계산해요. 친구 기기는 조작만 보내고 화면은 초당 20번 받은 상태를 110ms 늦게 부드럽게 보여 줘요.
  버튼은 횟수로 보내서 신호 하나가 빠져도 누른 게 사라지지 않아요.
- 연결: WebRTC P2P(STUN). 서로 직접 연결이 안 되는 네트워크면 데이터베이스 중계로 자동 전환돼요
  (초당 10번, 260ms 지연, 조금 덜 부드러움). TURN 서버를 붙이면 중계 없이 거의 다 직접 연결돼요(선택, 유료).
- 나가기: 일시정지 버튼 → 확인. 상대가 나가거나 8초 동안 신호가 없으면 그 점수로 경기가 끝나요.
- 방 정보는 `rooms/{코드}`에 있고 경기가 끝나면 지워요. 1시간이 지난 방은 다른 사람이 다시 쓸 수 있어요.

## ☁️ 계정 · 클라우드 저장 (설정 → 계정 · 클라우드 저장)
- **Google 로그인**: 앱은 Android Credential Manager(구글 계정 선택 창), 웹은 Google 공식 "Google로 로그인" 버튼.
  받은 Google ID 토큰을 Firebase Auth(`accounts:signInWithIdp`)에 넘겨요.
  친구 대전용 익명 계정이 있으면 그 계정에 Google을 연결해서 uid가 바뀌지 않아요.
- 저장 위치: `saves/{uid}` = `{data: 세이브 JSON 문자열, t: 저장 시각, p: 포인트, g: 경기 수}`. 본인만 읽고 쓸 수 있어요(규칙 파일).
- 올리는 때: 저장될 때마다 표시해 두고 최대 30초에 한 번, 앱이 뒤로 갈 때, **지금 저장** 버튼.
- **덮어쓰지 않는 규칙**: 마지막으로 맞춘 뒤 다른 기기가 저장했으면 올리지 않고 물어봐요.
  - 카드 두 장: 이 기기 / 클라우드(포인트 · 경기 수 · 펭귄 수 · 날짜). 고르지 않은 쪽은 지워져요.
  - 클라우드를 고르면 그 세이브로 게임이 다시 시작돼요. 다시 시작하기 전에는 예전 세이브가 다시 써지지 않게 막아 둬요.
  - 이 기기만 바뀌었으면 그냥 올려요.
  - 클라우드만 바뀌었으면 "다른 기기에서 저장한 새 진행이 있어요"라고 물어봐요.
- 로그아웃: 이 기기의 진행은 그대로 남아요.
- **계정 삭제**(Play 정책 필수): 확인 → 클라우드 세이브 삭제 → Firebase 계정 삭제 → 로그아웃. 이 기기의 진행은 남아요.
- 세이브 키 `penguinHockey.v1`은 그대로예요. 로그인 정보는 `penguinHockey.auth`, 동기화 표시는 `penguinHockey.cloud`(새 키).

## 소유자가 할 일 (출시 전)
1. **Firebase 프로젝트** 만들기(console.firebase.google.com). 기존 Google Cloud 프로젝트에 붙여도 돼요.
2. **Realtime Database** 만들기(지역은 `asia-southeast1` 권장) → 규칙에 `firebase/database.rules.json` 내용을 붙여 넣고 게시
   (또는 `firebase deploy --only database`).
3. **Authentication → 로그인 방법**: `익명`과 `Google` 사용 설정.
   - 익명은 친구 대전용이에요.
   - Google을 켜면 "웹 SDK 구성"에 **웹 클라이언트 ID**가 생겨요 → `webClientId`.
4. **Android 앱 지문(SHA-1)** 등록: Firebase 프로젝트 설정 → Android 앱 추가(패키지 `com.ysgames.penguingame`).
   등록할 SHA-1은 두 개예요.
   - Play Console → 앱 무결성 → **앱 서명 키** SHA-1(스토어에서 받은 앱용)
   - **업로드 키** SHA-1(직접 설치 테스트용)
   - 이게 없으면 앱에서 Google 로그인이 "개발자 오류"로 실패해요.
5. **웹에서도 로그인**하려면: Google Cloud 콘솔 → API 및 서비스 → 사용자 인증 정보 → 그 웹 클라이언트 ID의
   "승인된 JavaScript 원본"에 게임을 올린 주소를 추가하고, Firebase Authentication → 설정 → 승인된 도메인에도 추가.
   파일로 직접 연 HTML(file://)에서는 Google 로그인이 안 돼요.
6. **OAuth 동의 화면**: 앱 이름 · 지원 이메일 · 개인정보처리방침 URL 입력, 게시 상태를 "프로덕션"으로.
7. 빌드 폴더에 `firebase-config.json` 만들기(`firebase-config.example.json` 참고: `apiKey`, `dbUrl`, `webClientId`, 선택 `ice`)
   → `python3 apply_v10.py` → `cd android && ./gradlew bundleRelease`. 웹 API 키는 앱 안에 들어가도 괜찮은 값이에요(접근은 규칙이 막아요).
8. **Play Console**
   - 데이터 보안: 수집 항목에 "이메일 주소"(계정 관리)와 "앱 활동 · 게임 진행"(앱 기능)을 추가해요. 전송 중 암호화 예, 삭제 요청 가능 예.
   - 계정 삭제 URL: 앱 밖에서도 삭제를 요청할 수 있는 웹 페이지나 이메일 안내가 필요해요(Play 정책).
   - 개인정보처리방침에 Firebase(Google) 사용 · 저장 항목 · 삭제 방법을 추가해요.
9. 선택: TURN 서버(예: Cloudflare Calls TURN, Twilio)를 `ice`에 넣으면 회사 · 학교 와이파이에서도 직접 연결돼요.

## 테스트
- 단위: `node v31test.js`(친구 대전 로직, 네트워크 없이), `node v35test.js`(계정 · 클라우드, 에뮬레이터가 꺼져 있으면 온라인 항목은 SKIPPED).
- 브라우저 + Firebase 에뮬레이터(`cd firebase && firebase emulators:start --project demo-ph --only auth,database`):
  - `node v31net.js pc|tall`, `RELAY=1 node v31net.js pc`: 두 브라우저 프로필끼리 실제 탭으로 방 만들기 · 참가 · 경기 · 나가기.
  - `node v35acct.js pc|tall|wide <lang>`: 기기 두 대(같은 Google 계정)로 로그인 · 업로드 · 다른 기기에서 불러오기 · 충돌 · 로그아웃 · 계정 삭제.
    Google 버튼은 가짜 스크립트로 바꿔요(에뮬레이터는 서명 없는 ID 토큰을 받아 줘요).
- **확인 못 한 것**
  - 실제 Firebase 프로젝트와 실제 Google 로그인(웹 · 앱): 프로젝트와 클라이언트 ID가 아직 없어요.
  - 앱의 Credential Manager 화면: 실제 기기 · Play 서비스가 없어요. 빌드와 단위 테스트(클라이언트 ID 검사)만 했어요.
  - 서로 다른 실제 네트워크(통신사 · 와이파이) 사이의 WebRTC 연결: 테스트는 한 컴퓨터 안의 두 브라우저였어요.
