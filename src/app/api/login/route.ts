import { getBackendUrl } from '@/lib/base-path'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const res = await fetch(
      getBackendUrl('/api/auth/login'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),

        // 🔥 IMPORTANT for internal/self-signed SSL
        // @ts-ignore
        agent: new (require('https').Agent)({
          rejectUnauthorized: false,
        }),
      }
    )

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      status: res.status,
    })
  } catch (error: any) {
    console.error('API ERROR:', error)

    return new Response(
      JSON.stringify({
        message: error.message || 'Internal Server Error',
      }),
      { status: 500 }
    )
  }
}
