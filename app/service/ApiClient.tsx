const API_URL = 'http://185.146.3.132:8080'

type SignInParams = {
  phone: string
  password: string
}

type SignUpParams = {
  name: string
  phone: string
  password: string
}

type SignInResult = {
  token?: string
  userName?: string | null
  raw: unknown
}

export async function signIn({ phone, password }: SignInParams): Promise<SignInResult> {
  const res = await fetch(`${API_URL}/api/v1/auth/sign-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify({ phone, password }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data as { message?: string })?.message || 'Ошибка авторизации'
    throw new Error(message)
  }

  const token =
    (data as { token?: string }).token ||
    (data as { accessToken?: string }).accessToken ||
    (data as { data?: { token?: string } }).data?.token

  type WithUser = { user?: { name?: string } }
  const userName =
    (data as { name?: string }).name ||
    (data as { data?: { name?: string } }).data?.name ||
    ((data as WithUser).user?.name ?? null)

  return { token, userName: userName ?? null, raw: data }
}

export async function signUp({ name, phone, password }: SignUpParams): Promise<SignInResult> {
  const res = await fetch(`${API_URL}/api/v1/auth/sign-up`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify({ name, phone, password }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data as { message?: string })?.message || 'Ошибка регистрации'
    throw new Error(message)
  }

  const token =
    (data as { token?: string }).token ||
    (data as { accessToken?: string }).accessToken ||
    (data as { data?: { token?: string } }).data?.token

  type WithUser = { user?: { name?: string } }
  const userName =
    (data as { name?: string }).name ||
    (data as { data?: { name?: string } }).data?.name ||
    ((data as WithUser).user?.name ?? null) ||
    name

  return { token, userName: userName ?? null, raw: data }
}
