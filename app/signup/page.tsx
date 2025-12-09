'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import Header from '../components/Header'

const API_URL = 'http://185.146.3.132:8080/api/v1/auth/sign-up'

export default function SignInPage() {

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify({name, phone, password }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = data?.message || 'Ошибка авторизации'
        throw new Error(message)
      }

      // сохраняем токен/имя, если есть
      const token = data?.token || data?.accessToken || data?.data?.token
      const userName =
        data?.name ||
        data?.data?.name ||
        (typeof data === 'object' && data !== null && 'user' in data
          ? (data as { user?: { name?: string } }).user?.name
          : null) ||
        name
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        if (userName) localStorage.setItem('userName', String(userName))
      }

      // перейти на главную или остаться
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запроса')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-2xl font-bold">Регестрация</h1>
          <p className="text-sm text-gray-500">
            Авторизация в Altay Boots
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
        <div>
            <label className="text-sm font-medium text-gray-700">Имя</label>
            <input
              type="tel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder="Имя"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder="+77071112233"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder="Введите пароль"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            {loading ? 'Входим...' : 'Зарегестрироваться'}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

       

          <div className="mt-6 text-center text-sm text-gray-500">
            <Link href="/" className="text-rose-600 hover:underline">
              Вернуться на главную
            </Link>
            Войдите в систему <Link href="/signin" className="text-rose-600 hover:underline">здесь</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

