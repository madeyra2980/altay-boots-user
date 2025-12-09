;('use client')

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'

export default function AuthPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const authed = Boolean(token)
    setIsAuthed(authed)
    setChecking(false)
    if (authed) {
      router.replace('/')
    }
  }, [router])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-600">
        Проверяем сессию...
      </div>
    )
  }

  if (isAuthed) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 lg:flex-row">
        <div className="flex-1 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-gray-900">Уже регистрировались?</h2>
          <p className="mt-2 text-sm text-gray-600">Войдите в свой аккаунт Altay Boots.</p>
          <Link
            href="/signin"
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Войти
          </Link>
        </div>

        <div className="flex-1 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-gray-900">Нет аккаунта?</h2>
          <p className="mt-2 text-sm text-gray-600">Создайте новый профиль за минуту.</p>
          <Link
            href="/signup"
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-rose-600 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  )
}