'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

export default function SignupPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const { setSidebarOpen } = useUIStore()

  useEffect(() => {
    setSidebarOpen(false)
  }, [])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('모든 필드를 입력해주세요')
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('비밀번호가 일치하지 않습니다')
        return
      }

      if (formData.password.length < 6) {
        setError('비밀번호는 최소 6글자 이상이어야 합니다')
        return
      }

      // TODO: Supabase 인증 구현
      // 임시: 로컬 회원가입 시뮬레이션
      setUser({
        id: '1',
        name: formData.email.split('@')[0],
        email: formData.email,
      })

      router.push('/')
    } catch (err) {
      setError('회원가입 실패. 다시 시도해주세요.')
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">시작하기</h1>
          <p className="text-gray-500">가계부를 함께 관리해보세요</p>
        </div>

        {/* Signup Form */}
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
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#ff6b6b] focus:ring-2 focus:ring-[#ff6b6b] focus:ring-opacity-20"
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#ff8a80] to-[#ff6b6b] text-white font-bold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '회원가입 중...' : '회원가입'}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="text-[#ff6b6b] font-bold hover:underline"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
