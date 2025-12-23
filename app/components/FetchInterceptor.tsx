"use client"

import { useEffect } from "react"

export default function FetchInterceptor() {
  useEffect(() => {
    if (typeof window === "undefined") return
    // install only once
    const anyWin = window as any
    if (anyWin.__fetchInterceptorInstalled) return
    anyWin.__fetchInterceptorInstalled = true

    const originalFetch = window.fetch.bind(window)

    window.fetch = async (input: RequestInfo, init?: RequestInit) => {
      try {
        const token = localStorage.getItem('token')

        const modifiedInit: RequestInit = init ? { ...init } : {}
        // normalize headers
        const headers = new Headers(modifiedInit.headers || {})
        if (token) headers.set('Authorization', `Bearer ${token}`)
        modifiedInit.headers = headers

        const res = await originalFetch(input, modifiedInit)

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token')
          localStorage.removeItem('userName')
          localStorage.removeItem('userId')
          localStorage.removeItem('cartCount')
          window.dispatchEvent(new Event('storage'))
          // redirect to signin
          setTimeout(() => { window.location.href = '/signin' }, 50)
        }

        return res
      } catch (err) {
        return Promise.reject(err)
      }
    }

    return () => {
      // restore original fetch on unmount (unlikely) to avoid leaks
      try { (window as any).fetch = originalFetch } catch (_) {}
    }
  }, [])

  return null
}
