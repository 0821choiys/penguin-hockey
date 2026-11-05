# 펭귄 하키 — 안드로이드 앱 포장 (2026-11-04, v28)

Play 스토어용 앱은 `android/`에 있어요. 게임 HTML 하나를 앱 안에 넣고 전체 화면 WebView로 띄우는 구조예요.
게임 쪽 연결 코드는 `v28_app.js`이고, 앱이 아닌 일반 브라우저에서는 아무것도 바뀌지 않아요.

## 구조
- **패키지 이름(applicationId):** `com.penguinhockey.game` (임시). **첫 업로드 뒤에는 절대 바꿀 수 없어요.** 업로드 전에 확정하고,
  바꾸려면 `./gradlew bundleRelease -PAPP_ID=원하는.이름`처럼 빌드하거나 `app/build.gradle.kts`의 기본값을 고쳐요.
- **버전:** versionCode 1 · versionName 1.0.0. 업데이트를 올릴 때마다 versionCode를 1씩 올려요.
- **SDK:** minSdk 24 (Android 7.0) · targetSdk 36 · compileSdk 36 · AGP 8.13.2 · Gradle 8.14.3 · Java.
- **라이브러리:** Play Billing 9.1.0 (2026-08-31부터 8 이상 필수), androidx.webkit 1.18.0, activity 1.11.0, core 1.17.0.
  (activity 1.13 / core 1.19는 compileSdk 37 + AGP 9가 필요해서 아직 안 올렸어요.)
- **게임 파일:** 빌드할 때 저장소 최상위의 `penguin-hockey-improved.html`이 `assets/index.html`로 복사돼요. 그러니 먼저 `python3 apply_v10.py`.
- **주소:** `https://appassets.androidplatform.net/assets/index.html` (WebViewAssetLoader). https 주소라 localStorage 저장이 그대로 동작해요.
  다른 주소의 링크는 게임 안이 아니라 바깥 브라우저로 열려요. 글꼴은 앱 안에 넣어 두어서 구글 글꼴 서버에 요청하지 않아요. 아래 '글꼴' 항목을 보세요.
- **권한:** 인터넷, 진동. Play Billing 라이브러리가 BILLING · 네트워크 상태 권한을 더해요.

## 글꼴 (구글 글꼴 요청 없음, 오프라인에서도 같은 모양)
- 앱 사본(`app/src/main/assets/index.html`)은 빌드할 때 `tools/bundle_fonts.py`가 만들어요. 저장소의 웹용 HTML은 그대로 Google Fonts를 써요.
- 웹 버전이 쓰는 글꼴을 모두 WOFF2로 앱 안에 넣었어요(Google이 보내는 것과 같은 fontsource 파일, 774개).
  - `fonts/fonts.css`: Fredoka 500·700, Jua 400(한글 포함) — 항상
  - `fonts/mplus.css`: M PLUS Rounded 1c 500·700·800 — 일본어일 때만 불러와요
  - `fonts/notosc.css`: Noto Sans SC 500·700·900 — 중국어일 때만 불러와요
- 앱 크기: APK 약 15MB, AAB 약 15MB(글꼴 포함). 화면에 필요한 글자 구간 파일만 그때그때 읽어요.
- 빌드 스크립트는 구글 글꼴 주소가 하나라도 남으면 실패해요. APK 안의 구글 주소는 0건으로 확인했어요.
- 글꼴 원본은 `br/node_modules/@fontsource`에서 읽어요(`cd br && npm ci` 필요).
- 확인: `node br/appfonts.js ko|ja|zh` — 외부 요청 0건, 각 언어의 글꼴이 번들에서 로드됨 (ko 5/5, ja 6/6, zh 6/6).

## 게임 ↔ 앱 연결 (`PHAndroid`)
- 앱이 `addWebMessageListener`로 `window.PHAndroid`를 넣어요. **앱 자신의 주소에서만** 쓸 수 있어요.
- 메시지는 JSON이에요. 게임 → 앱 `{id,op,arg}` (op: `price` · `buy` · `consume` · `list` · `vib` · `save`), 앱 → 게임 `{id,ok,data|err,name}`,
  그리고 Play가 나중에 결제를 알려 줄 때 `{ev:'purchase'}`.
- 게임은 이걸로 v27의 `window.PHBilling` 계약(price/buy/consume/list)을 만들어요. 그래서 프로 패스 코드는 그대로예요.

## 결제 (`BillingBridge.java`)
- 상품 `pro_pass`(인앱 상품 · 소모성)를 Google Play로 사요. 가격은 Play가 알려 준 값을 화면에 써요(못 받으면 8,900원).
- 결제 완료(PURCHASED) → 게임이 토큰을 한 번만 지급(save.pay.tok) → 소모 처리 → 다음 시즌에 다시 살 수 있어요.
- 앱을 켤 때와 다시 돌아올 때마다 소모 안 된 결제를 찾아 지급해요(앱이 중간에 꺼져도 잃지 않아요).
- **대기 중 결제**(현금 · 통신사 결제 등)는 지급하지 않고 "결제 승인을 기다리고 있어요" 안내만 해요. Play가 승인을 알려 주면 그때 지급해요.
- 취소하면 아무것도 지급하지 않아요. 소모 처리를 하면 Google에도 확인(acknowledge)된 것으로 처리돼요(3일 안에 확인 안 하면 자동 환불되는 규칙 대비).
- **한계:** 결제 확인 서버가 없어요. 기기 저장 데이터를 고치면 프로 혜택을 열 수 있고, 환불된 결제를 되돌리지 못해요.

## 뒤로가기 · 일시정지 · 저장
- 뒤로가기(`phBack`): 열린 창(카드 정보 · 확인 창 · 뽑기/합성/강화 결과 · 튜토리얼 질문)을 먼저 닫아요 → 기술 컷신은 건너뛰기 →
  경기 중에는 일시정지, 일시정지 화면에서는 경기 계속 → 결과 화면은 메인 메뉴 → 다른 화면은 그 화면의 '뒤로/완료' 버튼과 같은 곳으로 →
  메인 메뉴에서는 "한 번 더 누르면 게임을 끝내요"를 띄우고 2초 안에 한 번 더 누르면 종료.
- 앱이 백그라운드로 가면(`phPause`) 경기를 일시정지하고 소리를 끄고, 저장 데이터를 앱 파일(`files/save.json`)에도 복사해요.
  저장할 때마다(4초에 한 번까지) 복사도 해요.
- **백업:** Android 자동 백업에는 `save.json`만 들어가요. 앱을 지웠다 다시 깔거나 새 폰으로 옮기면, 게임이 시작되기 전에
  그 저장 데이터를 localStorage에 넣어 줘요(이미 저장이 있으면 덮어쓰지 않아요).
- 진동은 앱이 직접 해요(0–1000ms로 제한). 화면은 경기 중 꺼지지 않고, 상태 표시줄 · 내비게이션 바는 숨겨요(위에서 쓸어내리면 잠깐 보여요).
  카메라 구멍(노치) 자리는 피해서 그려요. 가로 · 세로 회전은 휴대폰 설정을 따라요.
- WebView가 메모리 부족 등으로 죽으면 앱이 꺼지지 않고 게임을 다시 불러와요.

## 아이콘 · 이름 · 화면 방향
- **아이콘 (2026-11-05):** 소유자가 보낸 그림(`android/art/icon-source.png`, 1254², 하키채를 든 파란 헬멧 펭귄)을 써요.
  `android/art/newicon.py`가 만들어요. 원본의 둥근 모서리 바깥(검은색)은 사방 70px를 잘라 없애요.
  - 적응형 아이콘: 108dp 중 76dp에 그림을 넣어요. 런처가 보여 주는 가운데 72dp 안에 그림의 약 95%가 들어가요.
    바깥은 그림을 키우고 흐리게 해서 채워요. 원형·둥근 사각형·사각형 마스크에서 헬멧과 하키채가 모두 보이는 것을 미리보기로 확인했어요.
  - 옛 기기(Android 7)용: 둥근 사각형 그림이에요.
  - Play 스토어 512px 아이콘: `android/art/store_icon_512.png` (정사각형, 모서리는 Play가 둥글게 해요).
  - 단색 테마 아이콘은 없어요. 테마 아이콘을 켠 기기에서는 원래 그림이 그대로 보여요.
- 앱 이름: 펭귄하키(ko) · Penguin Hockey(기본/en) · 企鹅冰球(zh) · ペンギンホッケー(ja).
- **화면 방향:** 세로 고정이에요(`userPortrait`: 세로와 거꾸로 세로만, 기기 회전 잠금 설정을 따라요).
  - 앱을 **게임**(`android:appCategory="game"`)으로 표시했어요. Android 16(targetSdk 36)은 태블릿(sw600dp 이상)에서
    방향 고정을 무시하지만, 게임은 예외라서 태블릿에서도 세로로 고정돼요.
  - 웹(HTML) 버전은 브라우저가 방향을 고정할 수 없어서 가로 화면 배치가 그대로 남아 있어요.

## 빌드
```
python3 apply_v10.py                  # 게임 HTML 먼저
cd android
echo "sdk.dir=/path/to/android-sdk" > local.properties
./gradlew assembleDebug               # 테스트용 APK (디버그 키 서명)
./gradlew bundleRelease               # Play 업로드용 AAB (keystore.properties가 있으면 업로드 키로 서명)
./gradlew testDebugUnitTest lintDebug # 단위 테스트(SaveStore) + lint
node tools/savestore-check.js         # SaveStoreTest가 만든 복원 스크립트를 실제로 실행해 확인
```
- **업로드 키:** `keystore.properties`(storeFile · storePassword · keyAlias · keyPassword)를 `android/`에 두면 release가 그 키로 서명돼요.
  키 파일과 비밀번호는 **저장소에 올리지 않아요**(.gitignore). Play App Signing을 쓰면 Google이 앱 서명 키를 보관하고,
  업로드 키를 잃어버려도 Play Console에서 재설정을 요청할 수 있어요.

## 테스트
- `node v28test.js` (Node): 연결 메시지 · 프로 패스 구매/취소/오류/나중 승인 · 진동 · 저장 복사 · 뒤로가기 · 일시정지 (16개).
- `cd br && node v28app.js <pc|tall|wide> <ko|en|zh|ja>` (실제 브라우저 + 앱 쪽 모의): 결제 버튼 실제 탭(취소 · 대기 · 성공),
  12개 화면 뒤로가기, 카드 창 닫기, 경기 일시정지/계속, 백그라운드 저장, 종료 두 번 누르기, 번역 (24개).
- `android/app/src/test/.../SaveStoreTest.java` (JVM) + `android/tools/savestore-check.js`: 저장 복사 파일과 복원 스크립트.
- **확인 못 한 것:** 실제 휴대폰/에뮬레이터 실행(이 작업 환경에는 KVM이 없어 에뮬레이터를 못 돌려요), 실제 Google Play 결제
  (Play Console에 앱과 `pro_pass` 상품이 등록되고 테스트 트랙에 올라가야 동작), 자동 백업 복원, 기기별 노치 · 회전.

## Google 로그인 (2026-11-05, v35)
- `GoogleAuth.java`: Credential Manager로 Google 계정 선택 창을 띄우고 Google ID 토큰을 게임에 넘겨요(op `gsignin` {cid} → {idToken,email,name}, `gsignout`).
  앱은 토큰을 저장하지 않아요. Firebase 교환과 클라우드 저장은 게임(`v35_acct.js`)이 해요.
- 의존성: `androidx.credentials:credentials` · `credentials-play-services-auth` 1.5.0, `com.google.android.libraries.identity.googleid:googleid` 1.1.1.
  R8 keep 규칙은 `proguard-rules.pro`에 있어요.
- 필요한 것: Firebase에 Android 앱을 등록하고 **앱 서명 키 SHA-1 + 업로드 키 SHA-1**을 넣어야 해요. 없으면 로그인이 실패해요.
  자세한 순서는 `online-account.md`에 있어요.
- `tools/bundle_fonts.py`의 검사를 `fonts.googleapis`로 좁혔어요(로그인 API 주소 identitytoolkit / securetoken.googleapis.com은 글꼴이 아니에요).
