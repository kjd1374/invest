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
    // Alpha Vantage API를 사용한 티커 검색
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) {
      // API 키가 없으면 간단한 매핑 사용 (데모용)
      return getTickerFromMapping(companyName)
    }

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(companyName)}&apikey=${apiKey}`
    )

    if (response.data.bestMatches && response.data.bestMatches.length > 0) {
      return response.data.bestMatches[0]['1. symbol']
    }

    return getTickerFromMapping(companyName)
  } catch (error) {
    console.error('Ticker search error:', error)
    return getTickerFromMapping(companyName)
  }
}

// 간단한 티커 매핑 (API 키가 없을 때 사용)
function getTickerFromMapping(companyName: string): string | null {
  const mapping: { [key: string]: string } = {
    apple: 'AAPL',
    microsoft: 'MSFT',
    google: 'GOOGL',
    amazon: 'AMZN',
    tesla: 'TSLA',
    meta: 'META',
    nvidia: 'NVDA',
    삼성전자: '005930.KS',
    sk하이닉스: '000660.KS',
    네이버: '035420.KS',
    카카오: '035720.KS',
  }

  const key = companyName.toLowerCase().trim()
  return mapping[key] || null
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

