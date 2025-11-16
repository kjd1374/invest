'use client'

import { useState, FormEvent } from 'react'

interface SearchFormProps {
  onSearch: (companyName: string) => void
  loading: boolean
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [companyName, setCompanyName] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (companyName.trim()) {
      onSearch(companyName.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-4">
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="회사명을 입력하세요 (예: Apple, 삼성전자)"
          className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !companyName.trim()}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>
    </form>
  )
}

