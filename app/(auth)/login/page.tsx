'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const { setSidebarOpen } = useUIStore()

  useEffect(() => {
    setSidebarOpen(false)
  }, [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email || !password) {
        setError('이메일과 비밀번호를 입력해주세요')
        return
      }

      // TODO: Supabase 인증 구현
      // 임시: 로컬 로그인 시뮬레이션
      setUser({
        id: '1',
        name: email.split('@')[0],
        email,
      })

      router.push('/')
    } catch (err) {
      setError('로그인 실패. 다시 시도해주세요.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5f3] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">❤️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">가계부</h1>
          <p className="text-gray-500">부부가 함께 관리하는 가계부</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-4"
        >
          {/* Email Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#ff6b6b] focus:ring-2 focus:ring-[#ff6b6b] focus:ring-opacity-20"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#ff6b6b] focus:ring-2 focus:ring-[#ff6b6b] focus:ring-opacity-20"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#ff8a80] to-[#ff6b6b] text-white font-bold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* Signup Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            계정이 없으신가요?{' '}
            <Link
              href="/signup"
              className="text-[#ff6b6b] font-bold hover:underline"
            >
              회원가입
            </Link>
          </p>
        </div>

        {/* Demo Button */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={() => {
              setEmail('demo@example.com')
              setPassword('demo123')
            }}
            className="w-full py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
          >
            데모 계정으로 시작
          </button>
        </div>
      </div>
    </div>
  )
}
