# SeeMeet_Server

## ERD ##

![ERD](https://user-images.githubusercontent.com/69101054/150117506-3930e2fa-c19c-4980-9f92-aff341192d00.PNG)

---
## 서비스 핵심 기능 ##

![SeeMeet](https://user-images.githubusercontent.com/69101054/150117966-f6f7ea35-098b-4d9e-b052-b14a7af4f1cc.jpg)

--

## 팀별 역할 분담 ##

### 구건모 ###

* 초대장 API
  - 초대장 신청
  - 받은 모든 요청 조회
  - 특정 요청 조회
  - 보낸 특정 요청 확정
  - 보낸 특정 요청 취소
* 초대장 응답 API
  - 받은 특정 요청 응답
  - 받은 특정 요청 불참

### 남지윤 ###

* 약속 API
  - 모든 약속 조회
  - 캘린더 특정 약속 조회
  - 다가오는 약속 조회
  - 초대장 신청시 약속 조회
  - 마지막 약속 날짜 조회
  - 약속 수정

### 손시형 ###

* Auth API
  - 회원가입
  - 로그인
  - 회원탈퇴
* 친구리스트 API
  - 친구 추가
  - 친구 목록 조회
  - 유저 검색
  - 친구 차단
  - 친구 차단 

---

## 컨벤션 ##

### 코드 컨벤션

1. 파라미터의 **기본값**을 설정
2. **맨 위**에서 변수를 선언하고 초기화
3. **camelCase**사용
4. 여는 **괄호 다음**과, 닫는 **괄호 이전**에 **공백은 없음**
5. = + - * / 연산자 **양옆에 스페이스** 넣기
6. , 뒤에 스페이스 넣기
7. 주석사용 공백 추가, 열 맞추기,

```
// good
if (ture) {
    // 한줄 주석
    getUser();
}

if (age > 20) {

    /*
     * 여러줄 주석에는 한줄 주석을 사용하지 맙시다
     * 공백 추가, 열 맞추기 필수
     */
    getUser();
}
```

1. 상수는 대문자를 사용하기, 여러단어면 _사용
2. class는 PascalCase로 작성
3. 읽기 쉽고 알기쉬운 **변수명**으로 만들기

- 단수화 시켜 이름을 명확히 한다.

```
// great - "name" implies strings
const fruitName = ['apple', 'banana', 'cucumber'];
const fruit = [{name: 'apple',genus: 'malus’}]
```

- boolean같은 경우 “is”, “has”, “can”과 같은 접두어와 같이 사용한다.

```
// good
const isOpen = true; const canWrite = true; const hasFruit = true;
```

- 숫자일 경우 max, min, total과같은 단어로 설명한다.

```
// good
let totalNum = 54;
```

- 함수일경우 동사와 명사를 사용하여 actionResource의 형식을 따르는 것이 좋다

```
// good
const getUser = (firstName, LastName) => firstName + LastName
/* 검증코드에는 vaildate 단어 사용 등... */
```

### 커밋메시지 컨벤션

- ✅ [Chore] : 코드 수정, 내부 파일 수정
- ✨ [Feat] : 새로운 기능 구현
- ➕ [Add] : Feat 이외의 부수적인 코드 추가, 라이브러리 추가, 새로운 파일 생성 시
- 🚑️ [HOTFIX] : issue나, QA에서 급한 버그 수정에 사용
- 🔨 [Fix] : 버그, 오류 해결
- ⚰️ [Del] : 쓸모없는 코드 삭제
- 📝 [Docs] : README나 WIKI 등의 문서 개정
- 💄 [Mod] : storyboard 파일,UI 수정한 경우
- ✏️ [Correct] : 주로 문법의 오류나 타입의 변경, 이름 변경 등에 사용합니다.
- 🚚 [Move] : 프로젝트 내 파일이나 코드의 이동
- ⏪️ [Rename] : 파일 이름 변경이 있을 때 사용합니다.
- ♻️ [Refactor] : 전면 수정이 있을 때 사용합니다
- 🔀 [Merge]: 다른브렌치를 merge 할 때 사용합니다.

### Branches 컨벤션

- `main` : 메인 브랜치

- `main`에 직접적인 commit, push는 가급적 금지합니다

- 작업 전, 반드시 `main` 브랜치를 pull 받고 시작합니다

  ```markdown
  git pull origin main
  ```

- 기능 개발 시 `feature/기능` 브랜치를 파서 관리합니다

  ```markdown
  git branch feature/기능
  ```

- 작은 기능별로 `commit message rules`에 따라 커밋을 진행합니다

- 작업 완료 시 `main` 브랜치로 Pull Request를 보냅니다

- 팀원과 코드리뷰를 진행한 후, 최종적으로 `main` 브랜치로 merge합니다

- 다 쓴 브랜치는 삭제합니다

## 프로젝트 폴더 구조

```
📦functions 

┣ 📂api 

┃ ┣ 📂routes

 ┃ ┃ ┣ 📂auth

 ┃ ┃ ┃ ┣ 📜authLoginEmailPOST.js

 ┃ ┃ ┃ ┣ 📜authSignupPOST.js

 ┃ ┃ ┃ ┣ 📜index.js
 
 ┃ ┃ ┣ 📂friend
 
 ┃ ┃ ┃ ┣ 📜friendAcceptPUT(unuse).js
  
 ┃ ┃ ┃ ┣ 📜friendAddPOST.js
 
 ┃ ┃ ┃ ┣ 📜friendBlockPUT.js
 
 ┃ ┃ ┃ ┣ 📜friendCancelBlockPUT.js
 
 ┃ ┃ ┃ ┣ 📜friendListGET.js
 
 ┃ ┃ ┃ ┣ 📜frienSearchGET.js

 ┃ ┃ ┃ ┣ 📜index.js
 
 ┃ ┃ ┣ 📂 invitation
 
 ┃ ┃ ┃ ┣ 📜inviataionCanclePUT.js
 
 ┃ ┃ ┃ ┣ 📜inviataionConfirmPost.js

 ┃ ┃ ┃ ┣ 📜inviataionGET.js

 ┃ ┃ ┃ ┣ 📜inviataionPOST.js

 ┃ ┃ ┃ ┣ 📜inviataionListGET.js

 ┃ ┃ ┃ ┣ 📜index.js 
 
 ┃ ┃ ┣ 📂 invitationResponse
 
 ┃ ┃ ┃ ┣ 📜index.js
 
 ┃ ┃ ┃ ┣ 📜invitationRejectPOST.js 

 ┃ ┃ ┃ ┣ 📜invitationResponsePOST.js 

 ┃ ┃ ┣ 📂 user

 ┃ ┃ ┃ ┣ 📜userDELETE.js 

 ┃ ┃ ┃ ┣ 📜index.js 

 ┃ ┃ ┣ 📂 plan

 ┃ ┃ ┃ ┣ 📜 planComeGET.js

 ┃ ┃ ┃ ┣ 📜 planDateGET.js

 ┃ ┃ ┃ ┣ 📜 planDetailGET.js

 ┃ ┃ ┃ ┣ 📜 planinvitationGET.js

 ┃ ┃ ┃ ┣ 📜 planLastGET.js

 ┃ ┃ ┃ ┣ 📜 planMonthGET.js

 ┃ ┃ ┃ ┣ 📜index.js 

 ┃ ┣ 📜index.js

┣ 📂config

 ┃ ┣ 📜dbConfig.js 

 ┃ ┣ 📜 firebaseClient.js 

┣ 📂constants

 ┃ ┣ 📜 responseMessage.js

 ┃ ┣ 📜 statusCode.js

 ┃ ┣ 📜 jwt.js

 ┣ 📂db

 ┃ ┣ 📜db.js
 
 ┃ ┣ 📜friend.js

 ┃ ┣ 📜invitationResponse.js
 
 ┃ ┣ 📜invitation.js

 ┃ ┣ 📜user.js

 ┃ ┣ 📜plan.js

 ┃ ┣ 📜index.js

 ┣ 📂lib

 ┃ ┣ 📜util.js

 ┃ ┣ 📜convertSnakeToCamel.js

 ┃ ┣ 📜jwtHandlers.js

 ┣ 📜.eslintrc.js

 ┣ 📜.prettierrc.js

 ┣ 📜index.js
```

## API 로직 구현 진척도 ##

#### 현재 구현 API/전체 API = 21/21 ####

#### 100퍼센트 구현 ####


## dependencies module ##
```
{
  "name": "functions",
  "description": "Cloud Functions for Firebase",
  "scripts": {
    "lint": "eslint .",
    "serve": "cross-env NODE_ENV=development firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "cross-env NODE_ENV=production firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "16"
  },
  "main": "index.js",
  "dependencies": {
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dayjs": "^1.10.7",
    "dotenv": "^14.1.0",
    "eslint-config-prettier": "^8.3.0",
    "express": "^4.17.2",
    "firebase": "^9.6.3",
    "firebase-admin": "^9.8.0",
    "firebase-functions": "^3.14.1",
    "helmet": "^5.0.1",
    "hpp": "^0.2.3",
    "jsonwebtoken": "^8.5.1",
    "pg": "^8.7.1"
  },
  "devDependencies": {
    "eslint": "^7.6.0",
    "eslint-config-google": "^0.14.0",
    "firebase-functions-test": "^0.2.0"
  },
  "private": true
}
```

