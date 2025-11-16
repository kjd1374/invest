'use client'

interface StockInfoProps {
  data: {
    company: string
    ticker: string
    price?: number
    change?: number
    changePercent?: number
    volume?: number
    marketCap?: number
  }
}

export default function StockInfo({ data }: StockInfoProps) {
  const isPositive = (data.change || 0) >= 0

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📊 {data.company} ({data.ticker})
      </h2>
      
      {data.price !== undefined && (
        <div className="space-y-4">
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold text-gray-900">
              ${data.price.toFixed(2)}
            </span>
            <span
              className={`text-xl font-semibold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? '+' : ''}
              {data.change?.toFixed(2)} ({isPositive ? '+' : ''}
              {data.changePercent?.toFixed(2)}%)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            {data.volume !== undefined && (
              <div>
                <p className="text-sm text-gray-500">거래량</p>
                <p className="text-lg font-semibold text-gray-800">
                  {data.volume.toLocaleString()}
                </p>
              </div>
            )}
            {data.marketCap !== undefined && (
              <div>
                <p className="text-sm text-gray-500">시가총액</p>
                <p className="text-lg font-semibold text-gray-800">
                  ${(data.marketCap / 1e9).toFixed(2)}B
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

