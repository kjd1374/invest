import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import OpenAI from 'openai'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const company = searchParams.get('company')

  if (!ticker || !company) {
    return NextResponse.json(
      { error: '티커와 회사명이 필요합니다.' },
      { status: 400 }
    )
  }

  try {
    // 뉴스 가져오기
    const newsArticles = await fetchNews(company, ticker)

    // 뉴스 감정 분석
    const analyzedNews = await analyzeNewsSentiment(newsArticles)

    return NextResponse.json(analyzedNews)
  } catch (error: any) {
    console.error('News API Error:', error)
    return NextResponse.json(
      { error: error.message || '뉴스 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 뉴스 가져오기
async function fetchNews(company: string, ticker: string) {
  try {
    const newsApiKey = process.env.NEWS_API_KEY

    if (!newsApiKey) {
      console.log('News API key not found')
      return getDummyNews(company)
    }

    // 한국 회사명인 경우 영어 이름도 함께 검색
    const searchQuery = company.includes('삼성') ? 'Samsung' : 
                       company.includes('SK') ? 'SK Hynix' :
                       company.includes('네이버') ? 'Naver' :
                       company.includes('카카오') ? 'Kakao' : company

    console.log('Fetching news for:', searchQuery)
    
    // News API 사용
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&sortBy=publishedAt&language=en&pageSize=20&apiKey=${newsApiKey}`
    )

    console.log('News API response status:', response.status)

    // API 에러 체크
    if (response.data.status === 'error') {
      console.error('News API error:', response.data.message)
      throw new Error(response.data.message || '뉴스를 가져오는데 실패했습니다.')
    }

    if (response.data.articles && response.data.articles.length > 0) {
      const articles = response.data.articles
        .filter((article: any) => article.title && article.title !== '[Removed]')
        .map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source?.name,
        }))
      
      if (articles.length > 0) {
        console.log(`Found ${articles.length} news articles`)
        return articles
      }
    }

    console.log('No articles found, using dummy news')
    return getDummyNews(company)
  } catch (error: any) {
    console.error('News fetch error:', error.response?.data || error.message)
    // 에러가 발생해도 더미 뉴스 반환 (서비스 중단 방지)
    return getDummyNews(company)
  }
}

// 더미 뉴스 데이터 (데모용)
function getDummyNews(company: string) {
  return [
    {
      title: `${company}의 실적이 예상을 뛰어넘어 주가 상승`,
      description: `${company}가 분기 실적에서 예상을 뛰어넘는 성과를 보이며 주가가 상승했습니다.`,
      url: '#',
      publishedAt: new Date().toISOString(),
      source: 'Financial News',
    },
    {
      title: `${company}, 새로운 제품 출시로 시장 기대감 상승`,
      description: `${company}가 혁신적인 신제품을 출시하며 투자자들의 관심을 끌고 있습니다.`,
      url: '#',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: 'Tech News',
    },
    {
      title: `${company}의 경영진 변화로 불확실성 증가`,
      description: `${company}의 주요 경영진 변화로 인해 시장의 불확실성이 증가하고 있습니다.`,
      url: '#',
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: 'Business News',
    },
    {
      title: `${company} 주가 하락, 시장 우려 확산`,
      description: `${company}의 주가가 하락하며 투자자들의 우려가 확산되고 있습니다.`,
      url: '#',
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: 'Market News',
    },
  ]
}

// 뉴스 감정 분석
async function analyzeNewsSentiment(newsArticles: any[]) {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    // OpenAI API 키가 없으면 키워드 기반 분석
    return analyzeNewsByKeywords(newsArticles)
  }

  try {
    const openai = new OpenAI({ apiKey: openaiApiKey })
    const positive: any[] = []
    const negative: any[] = []
    const neutral: any[] = []

    // 각 뉴스에 대해 감정 분석 수행
    for (const article of newsArticles) {
      try {
        const prompt = `다음 뉴스 제목과 내용을 분석하여 감정을 판단해주세요. 
제목: ${article.title}
내용: ${article.description || ''}

다음 중 하나로만 답변해주세요: positive, negative, neutral`

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 10,
        })

        const sentiment = completion.choices[0]?.message?.content?.toLowerCase().trim() || 'neutral'

        const articleWithSentiment = {
          ...article,
          sentiment: sentiment.includes('positive') ? 'positive' : sentiment.includes('negative') ? 'negative' : 'neutral',
        }

        if (articleWithSentiment.sentiment === 'positive') {
          positive.push(articleWithSentiment)
        } else if (articleWithSentiment.sentiment === 'negative') {
          negative.push(articleWithSentiment)
        } else {
          neutral.push(articleWithSentiment)
        }
      } catch (error) {
        // 개별 뉴스 분석 실패 시 키워드 기반으로 폴백
        const sentiment = analyzeSingleNewsByKeywords(article)
        article.sentiment = sentiment
        if (sentiment === 'positive') {
          positive.push(article)
        } else if (sentiment === 'negative') {
          negative.push(article)
        } else {
          neutral.push(article)
        }
      }
    }

    return { positive, negative, neutral }
  } catch (error) {
    console.error('OpenAI API error:', error)
    return analyzeNewsByKeywords(newsArticles)
  }
}

// 키워드 기반 감정 분석 (폴백)
function analyzeNewsByKeywords(newsArticles: any[]) {
  const positive: any[] = []
  const negative: any[] = []
  const neutral: any[] = []

  for (const article of newsArticles) {
    const sentiment = analyzeSingleNewsByKeywords(article)
    article.sentiment = sentiment
    if (sentiment === 'positive') {
      positive.push(article)
    } else if (sentiment === 'negative') {
      negative.push(article)
    } else {
      neutral.push(article)
    }
  }

  return { positive, negative, neutral }
}

function analyzeSingleNewsByKeywords(article: any): 'positive' | 'negative' | 'neutral' {
  const text = `${article.title} ${article.description || ''}`.toLowerCase()

  const positiveKeywords = [
    '상승', '증가', '성장', '개선', '성공', '혁신', '기대', '긍정', '호재',
    'rise', 'increase', 'growth', 'improve', 'success', 'innovation', 'expect', 'positive', 'gain', 'profit', 'up'
  ]

  const negativeKeywords = [
    '하락', '감소', '손실', '실패', '우려', '부정', '악재', '위기', '문제',
    'fall', 'decrease', 'loss', 'fail', 'concern', 'negative', 'crisis', 'problem', 'down', 'decline'
  ]

  const positiveCount = positiveKeywords.filter(keyword => text.includes(keyword)).length
  const negativeCount = negativeKeywords.filter(keyword => text.includes(keyword)).length

  if (positiveCount > negativeCount) {
    return 'positive'
  } else if (negativeCount > positiveCount) {
    return 'negative'
  } else {
    return 'neutral'
  }
}

