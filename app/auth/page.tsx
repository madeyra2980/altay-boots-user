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
      <div >
        Проверяем сессию...
      </div>
    )
  }

  if (isAuthed) {
    return null
  }

  return (
    <div >
      <Header />
      <div >
        <div >
          <h2 >Уже регистрировались?</h2>
          <p >Войдите в свой аккаунт Altay Boots.</p>
          <Link
            href="/signin"
            
          >
            Войти
          </Link>
        </div>

        <div >
          <h2 >Нет аккаунта?</h2>
          <p >Создайте новый профиль за минуту.</p>
          <Link
            href="/signup"
            
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  )
}