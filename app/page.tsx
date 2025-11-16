'use client'

import { useState } from 'react'
import SearchForm from '@/components/SearchForm'
import StockInfo from '@/components/StockInfo'
import NewsList from '@/components/NewsList'

export default function Home() {
  const [stockData, setStockData] = useState<any>(null)
  const [newsData, setNewsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (companyName: string) => {
    setLoading(true)
    setError(null)
    setStockData(null)
    setNewsData(null)

    try {
      // 티커 검색 및 주가 정보 가져오기
      const stockResponse = await fetch(`/api/stock?company=${encodeURIComponent(companyName)}`)
      if (!stockResponse.ok) {
        throw new Error('주가 정보를 가져오는데 실패했습니다.')
      }
      const stock = await stockResponse.json()
      setStockData(stock)

      // 뉴스 정보 가져오기
      if (stock.ticker) {
        const newsResponse = await fetch(`/api/news?ticker=${stock.ticker}&company=${encodeURIComponent(companyName)}`)
        if (newsResponse.ok) {
          const news = await newsResponse.json()
          setNewsData(news)
        }
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📈 투자 정보 서비스
          </h1>
          <p className="text-gray-600">
            회사명을 입력하면 주가 정보와 뉴스를 확인할 수 있습니다
          </p>
        </div>

        <SearchForm onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {stockData && <StockInfo data={stockData} />}
        {newsData && <NewsList news={newsData} />}
      </div>
    </main>
  )
}

