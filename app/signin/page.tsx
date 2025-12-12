'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { signIn } from '../service/ApiClient'
import Link from 'next/link'

export default function SignInPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // Artificial delay
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const result = await signIn({ phone, password })
      if (result.token && typeof window !== 'undefined') {
        localStorage.setItem('token', result.token)
        if (result.userName) localStorage.setItem('userName', String(result.userName))
        if(result.userId) localStorage.setItem('userId', String(result.userId))
        // Триггерим событие storage для обновления Header
        window.dispatchEvent(new Event('storage'))
      }
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-block">
             <h2 className="text-3xl font-bold text-stone-900 tracking-tight hover:text-orange-600 transition-colors">ALTAY BOOTS</h2>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-stone-900">
            Вход в аккаунт
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Или{' '}
            <Link href="/signup" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
              зарегистрируйтесь бесплатно
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-stone-200">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-stone-700">
                Телефон
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-stone-300 px-3 py-2 placeholder-stone-400 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm transition-colors"
                  placeholder="+7 (XXX) XXX-XX-XX"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                Пароль
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-stone-300 px-3 py-2 placeholder-stone-400 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Ошибка входа</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-stone-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Входим...
                    </span>
                ) : 'Войти'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-stone-500">Навигация</span>
              </div>
            </div>

             <div className="mt-6 grid grid-cols-1">
              <Link
                href="/signup"
                className="flex w-full items-center justify-center rounded-md border border-stone-300 bg-white py-2 px-4 text-sm font-medium text-stone-500 shadow-sm hover:bg-stone-50 transition-colors"
              >
                Зарегистрироваться
              </Link>
            </div>
            

            <div className="mt-6 grid grid-cols-1">
              <Link
                href="/"
                className="flex w-full items-center justify-center rounded-md border border-stone-300 bg-white py-2 px-4 text-sm font-medium text-stone-500 shadow-sm hover:bg-stone-50 transition-colors"
              >
                Вернуться на главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
