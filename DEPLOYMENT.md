# 배포 가이드

이 프로젝트를 GitHub에 배포하고 Vercel을 통해 호스팅하는 방법입니다.

## 1. GitHub에 저장소 생성 및 푸시

```bash
# Git 초기화
git init

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit: 투자 정보 서비스"

# GitHub 저장소 생성 후 원격 저장소 추가
git remote add origin https://github.com/your-username/invest-service.git

# 푸시
git branch -M main
git push -u origin main
```

## 2. Vercel에 배포

### 방법 1: Vercel 웹사이트에서 배포 (권장)

1. [Vercel](https://vercel.com)에 가입/로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 환경 변수 설정:
   - `OPENAI_API_KEY`: OpenAI API 키
   - `ALPHA_VANTAGE_API_KEY`: Alpha Vantage API 키
   - `NEWS_API_KEY`: News API 키
5. "Deploy" 클릭

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 3. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

- `OPENAI_API_KEY`: 뉴스 감정 분석용
- `ALPHA_VANTAGE_API_KEY`: 주가 정보 조회용
- `NEWS_API_KEY`: 뉴스 수집용

## 4. API 키 발급 방법

### OpenAI API 키
1. [OpenAI Platform](https://platform.openai.com) 접속
2. 계정 생성/로그인
3. API Keys 메뉴에서 새 키 생성

### Alpha Vantage API 키
1. [Alpha Vantage](https://www.alphavantage.co/support/#api-key) 접속
2. 무료 API 키 신청

### News API 키
1. [News API](https://newsapi.org/register) 접속
2. 무료 계정 생성

## 참고사항

- API 키가 없어도 데모 모드로 동작합니다 (더미 데이터 사용)
- Vercel은 무료 플랜에서도 충분히 사용 가능합니다
- GitHub에 푸시하면 자동으로 재배포됩니다

