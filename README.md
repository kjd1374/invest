# 투자 정보 서비스

회사 이름을 입력하면 자동으로 티커를 검색하고, 해당 기업의 주가 정보와 주요 뉴스를 좋은 뉴스/나쁜 뉴스로 구분하여 보여주는 서비스입니다.

## 기능

- 🔍 회사명으로 티커 자동 검색
- 📈 실시간 주가 정보 표시
- 📰 주요 뉴스 수집 및 표시
- 😊😢 뉴스 감정 분석 (좋은 뉴스/나쁜 뉴스 구분)

## 시작하기

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```
OPENAI_API_KEY=your_openai_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
NEWS_API_KEY=your_news_api_key
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 배포

이 프로젝트는 Vercel에 배포할 수 있습니다. GitHub에 푸시하면 자동으로 배포됩니다.

