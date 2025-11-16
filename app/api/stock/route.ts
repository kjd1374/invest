import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const companyName = searchParams.get('company')

  if (!companyName) {
    return NextResponse.json(
      { error: '회사명이 필요합니다.' },
      { status: 400 }
    )
  }

  try {
    // 1. 회사명으로 티커 검색
    const ticker = await searchTicker(companyName)
    
    if (!ticker) {
      return NextResponse.json(
        { error: '티커를 찾을 수 없습니다. 다른 회사명으로 시도해주세요.' },
        { status: 404 }
      )
    }

    // 2. 주가 정보 가져오기
    const stockData = await getStockData(ticker)

    return NextResponse.json({
      company: companyName,
      ticker: ticker,
      ...stockData,
    })
  } catch (error: any) {
    console.error('Stock API Error:', error)
    // 에러 메시지를 더 명확하게 전달
    const errorMessage = error.message || '주가 정보를 가져오는데 실패했습니다.'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// 티커 검색 함수
async function searchTicker(companyName: string): Promise<string | null> {
  try {
    // 1. 먼저 매핑에서 확인 (한글 회사명 지원)
    const mappedTicker = getTickerFromMapping(companyName)
    if (mappedTicker) {
      console.log('Found ticker from mapping:', mappedTicker)
      return mappedTicker
    }

    // 2. Alpha Vantage API를 사용한 티커 검색
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) {
      // API 키가 없으면 매핑만 사용
      return null
    }

    // 3. 한글 회사명인 경우 영어 이름으로 변환
    const searchQuery = convertKoreanToEnglish(companyName) || companyName
    console.log('Searching ticker for:', searchQuery)

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(searchQuery)}&apikey=${apiKey}`
    )

    // API rate limit 체크
    if (response.data['Note']) {
      console.error('API rate limit:', response.data['Note'])
      // Rate limit이면 매핑으로 폴백
      return getTickerFromMapping(companyName)
    }

    if (response.data.bestMatches && response.data.bestMatches.length > 0) {
      const ticker = response.data.bestMatches[0]['1. symbol']
      console.log('Found ticker from API:', ticker)
      return ticker
    }

    // API에서 찾지 못하면 매핑으로 폴백
    return getTickerFromMapping(companyName)
  } catch (error) {
    console.error('Ticker search error:', error)
    // 에러 발생 시 매핑으로 폴백
    return getTickerFromMapping(companyName)
  }
}

// 한글 회사명을 영어 이름으로 변환
function convertKoreanToEnglish(companyName: string): string | null {
  const koreanToEnglish: { [key: string]: string } = {
    '삼성전자': 'Samsung Electronics',
    '삼성': 'Samsung',
    'sk하이닉스': 'SK Hynix',
    'sk': 'SK Hynix',
    '네이버': 'Naver',
    '카카오': 'Kakao',
    'lg전자': 'LG Electronics',
    'lg': 'LG',
    '현대자동차': 'Hyundai Motor',
    '현대': 'Hyundai',
    '기아': 'Kia',
    '포스코': 'POSCO',
    '셀트리온': 'Celltrion',
    '아모레퍼시픽': 'Amorepacific',
    '한화': 'Hanwha',
    '롯데': 'Lotte',
    'cj': 'CJ',
  }

  const normalized = companyName.trim()
  
  // 정확한 매칭 먼저 시도
  if (koreanToEnglish[normalized]) {
    return koreanToEnglish[normalized]
  }

  // 부분 매칭 시도
  for (const [korean, english] of Object.entries(koreanToEnglish)) {
    if (normalized.includes(korean) || korean.includes(normalized)) {
      return english
    }
  }

  return null
}

// 간단한 티커 매핑
function getTickerFromMapping(companyName: string): string | null {
  const mapping: { [key: string]: string } = {
    // 영어 회사명 (소문자)
    'apple': 'AAPL',
    'microsoft': 'MSFT',
    'google': 'GOOGL',
    'amazon': 'AMZN',
    'tesla': 'TSLA',
    'meta': 'META',
    'nvidia': 'NVDA',
    'samsung': '005930.KS',
    'samsung electronics': '005930.KS',
    // 한글 회사명
    '삼성전자': '005930.KS',
    '삼성': '005930.KS',
    'sk하이닉스': '000660.KS',
    'sk': '000660.KS',
    '네이버': '035420.KS',
    '카카오': '035720.KS',
    'lg전자': '066570.KS',
    'lg': '066570.KS',
    '현대자동차': '005380.KS',
    '현대': '005380.KS',
    '기아': '000270.KS',
    '포스코': '005490.KS',
    '셀트리온': '068270.KS',
    '아모레퍼시픽': '090430.KS',
    '한화': '000880.KS',
    '롯데': '004990.KS',
    'cj': '001040.KS',
  }

  // 정확한 매칭 (대소문자 구분 없이)
  const normalized = companyName.trim().toLowerCase()
  if (mapping[normalized]) {
    return mapping[normalized]
  }

  // 한글은 대소문자 변환 없이 직접 매칭
  const originalTrimmed = companyName.trim()
  if (mapping[originalTrimmed]) {
    return mapping[originalTrimmed]
  }

  // 부분 매칭 시도 (한글 회사명)
  for (const [key, ticker] of Object.entries(mapping)) {
    if (originalTrimmed.includes(key) || key.includes(originalTrimmed)) {
      return ticker
    }
  }

  return null
}

// 주가 정보 가져오기
async function getStockData(ticker: string) {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) {
      console.log('Alpha Vantage API key not found')
      // API 키가 없으면 더미 데이터 반환
      return {
        price: 150.25,
        change: 2.5,
        changePercent: 1.69,
        volume: 50000000,
        marketCap: 2500000000000,
      }
    }

    console.log('Fetching stock data for ticker:', ticker)
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`
    )

    console.log('Alpha Vantage response:', JSON.stringify(response.data).substring(0, 500))

    // API rate limit 체크
    if (response.data['Note']) {
      console.error('API rate limit:', response.data['Note'])
      throw new Error('API 호출 제한에 도달했습니다. 잠시 후 다시 시도해주세요.')
    }

    // 에러 메시지 체크
    if (response.data['Error Message']) {
      console.error('API error:', response.data['Error Message'])
      throw new Error(response.data['Error Message'])
    }

    const quote = response.data['Global Quote']
    if (!quote || Object.keys(quote).length === 0) {
      console.error('No quote data found in response')
      throw new Error('주가 정보를 찾을 수 없습니다.')
    }

    const price = parseFloat(quote['05. price'])
    const change = parseFloat(quote['09. change'])
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''))
    const volume = parseInt(quote['06. volume'])

    if (isNaN(price)) {
      throw new Error('주가 데이터 형식이 올바르지 않습니다.')
    }

    return {
      price,
      change,
      changePercent,
      volume,
      marketCap: price * volume,
    }
  } catch (error: any) {
    console.error('Stock data fetch error:', error)
    // 에러를 다시 throw하여 상위에서 처리하도록 함
    throw error
  }
}

