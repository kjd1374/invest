'use client'

interface NewsItem {
  title: string
  description: string
  url: string
  publishedAt: string
  sentiment: 'positive' | 'negative' | 'neutral'
  source?: string
}

interface NewsListProps {
  news: {
    positive: NewsItem[]
    negative: NewsItem[]
    neutral?: NewsItem[]
  }
}

export default function NewsList({ news }: NewsListProps) {
  const NewsSection = ({
    title,
    items,
    emoji,
    bgColor,
  }: {
    title: string
    items: NewsItem[]
    emoji: string
    bgColor: string
  }) => {
    if (items.length === 0) return null

    return (
      <div className={`${bgColor} rounded-lg shadow-lg p-6 mb-6`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {emoji} {title}
        </h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400">
                {item.source && <span>{item.source}</span>}
                <span>
                  {new Date(item.publishedAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <NewsSection
        title="좋은 뉴스"
        items={news.positive}
        emoji="😊"
        bgColor="bg-green-50"
      />
      <NewsSection
        title="나쁜 뉴스"
        items={news.negative}
        emoji="😢"
        bgColor="bg-red-50"
      />
      {news.neutral && news.neutral.length > 0 && (
        <NewsSection
          title="중립 뉴스"
          items={news.neutral}
          emoji="😐"
          bgColor="bg-gray-50"
        />
      )}
    </div>
  )
}

