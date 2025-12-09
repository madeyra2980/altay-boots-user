const API_URL:string = 'http://185.146.3.132:8080';


export default ApiClient = () => { 

    const Signin = async (url: string) => {
        try {
            const res = await fetch(API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                accept: '*/*',
              },
              body: JSON.stringify({ phone, password }),
            })
      
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
              const message = data?.message || 'Ошибка авторизации'
              throw new Error(message)
            }
      
            const token = data?.token || data?.accessToken || data?.data?.token
            type WithUser = { user?: { name?: string } }
            const userName =
              data?.name ||
              data?.data?.name ||
              (typeof data === 'object' && data !== null && 'user' in data
                ? (data as WithUser).user?.name
                : null) ||
              phone
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

    // const post = async (url: string, data: string) => {
    //     const response = await fetch(`${API_URL}${url}`, {
    //         method: 'POST',
    //         body: JSON.stringify(data),
    //     });
    //     return response.json();
    // }

}



