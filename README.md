# SmallCam

프리미엄 모던 레트로 카메라 쇼핑몰. Next.js(App Router) + TypeScript + Tailwind CSS + Firebase로 제작되었습니다.

## 1. 설치

```bash
npm install
```

## 2. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트를 생성합니다.
2. **Authentication → Sign-in method**에서 Google 로그인을 활성화합니다.
3. **Firestore Database**를 생성합니다 (프로덕션 모드 권장).
4. **Storage**를 활성화합니다.
5. 프로젝트 설정 → 웹 앱 추가 후 발급받은 설정값을 `.env.local`에 입력합니다.

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 3. 보안 규칙 배포

`firestore.rules`, `storage.rules` 파일이 프로젝트 루트에 포함되어 있습니다. Firebase CLI로 배포하세요.

```bash
npm install -g firebase-tools
firebase login
firebase init   # 기존 프로젝트 연결, Firestore/Storage 규칙 경로 지정
firebase deploy --only firestore:rules,storage:rules
```

## 4. 관리자 계정 지정

1. 사이트에서 Google 로그인을 한 번 진행하면 Firestore `users` 컬렉션에 문서가 자동 생성됩니다 (기본 `role: "user"`).
2. Firebase Console → Firestore → `users/{내 uid}` 문서를 열어 `role` 필드를 `"admin"`으로 변경합니다.
3. 이후 로그아웃/재로그인하면 `/admin` 페이지에 접근할 수 있습니다.

## 5. 로컬 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인합니다.

## 6. Vercel 배포

1. GitHub 저장소에 푸시합니다.
2. Vercel에서 새 프로젝트로 가져옵니다.
3. 환경변수(`NEXT_PUBLIC_FIREBASE_*`)를 Vercel 프로젝트 설정에 동일하게 등록합니다.
4. 배포 후 Firebase Console → Authentication → Settings → 승인된 도메인에 배포 도메인을 추가합니다 (Google 로그인 팝업 동작을 위해 필수).

## Vercel 배포 오류: "Couldn't find any pages or app directory"

이 오류는 거의 항상 **저장소 구조 문제**입니다. Vercel은 (Root Directory 설정이 비어있다면) 저장소 최상위에 `package.json`과 `src/app` 폴더가 바로 있어야 인식합니다.

**원인 확인 방법**: GitHub 저장소 페이지를 열었을 때 파일 목록 맨 위에 `package.json`, `next.config.mjs`, `src` 폴더가 바로 보여야 정상입니다. 만약 그 안에 `smallcam` 같은 폴더가 한 번 더 감싸고 있다면 (`smallcam/package.json`, `smallcam/src/...`) 이게 원인입니다.

**해결 방법 1 — 저장소 구조를 고친다 (권장)**
```bash
# 압축을 푼 폴더 자체가 아니라, 그 "안의 내용물"이 저장소 루트로 가야 합니다
cd smallcam        # 프로젝트 폴더 안으로 이동
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/{계정}/{저장소}.git
git push -u origin main -f
```
즉, `git init`을 프로젝트 폴더 **안에서** 실행해야 하며, 폴더 자체를 통째로 다른 폴더에 넣고 커밋하면 안 됩니다.

**해결 방법 2 — 이미 잘못 올라갔다면 Vercel 설정에서 우회**
1. Vercel 프로젝트 → **Settings → General → Root Directory**
2. **Edit** 클릭 → 실제 프로젝트가 들어있는 하위 폴더 이름 입력 (예: `smallcam`)
3. 저장 후 **Redeploy**

둘 중 방법 1이 이후 관리가 더 편합니다.

## 폴더 구조

```
src/
  app/                 라우트 (App Router)
    admin/             관리자 페이지 (role: admin 전용)
    product/[id]/      상품 상세
    checkout/, cart/   장바구니, 주문
    mypage/            마이페이지, 주문 조회
  components/
    ui/                버튼, 스켈레톤, 빈 상태, 확인 모달, 브랜드 시그니처(Aperture)
    layout/             Navbar, Footer, 장바구니 Drawer
    home/, product/, order/, admin/
  context/             Auth / Cart / Toast Context
  lib/
    firebase/          Firestore·Storage·Auth 데이터 액세스 함수
    types.ts, utils.ts
firestore.rules         Firestore 보안 규칙 (role 기반 관리자 인가)
storage.rules            Storage 보안 규칙
```

## 주요 흐름 메모

- 회원가입은 Google 로그인만 지원하며, `users` 컬렉션에 `uid/name/email/profileImage/role/createdAt`이 저장됩니다.
- 관리자 권한은 Firestore `users/{uid}.role`로만 판별하며 코드에 하드코딩된 계정이 없습니다. `/admin`은 클라이언트 가드(`AdminGuard`) + Firestore 보안 규칙 이중으로 보호됩니다.
- 주문 상태는 `waiting_payment → payment_checking → paid → preparing → shipping → completed` 순으로 진행되며, 구매자는 `waiting_payment → payment_checking` 전환만 가능하고 이후 단계는 관리자만 변경할 수 있습니다(Firestore 규칙에도 동일하게 강제됨).
- 상품 이미지는 Firebase Storage `products/{productId}/...` 경로에 저장됩니다.

## 다음 단계로 좋은 확장

- 결제 대행사(토스페이먼츠, 아임포트 등) 연동으로 무통장입금 대신 실시간 카드결제 지원
- Firestore Cloud Functions로 주문 상태 변경 시 이메일/알림 발송
- 상품 검색 및 필터(가격대, 브랜드) UI
