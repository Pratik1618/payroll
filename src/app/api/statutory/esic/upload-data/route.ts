import { NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/base-path'

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') ?? ''
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/)
    const token = tokenMatch?.[1]

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const type = url.searchParams.get('type') ?? ''
    const month = url.searchParams.get('month') ?? ''

    const res = await fetch(
      getBackendUrl(
        `/api/statutory/esic/upload-data?type=${encodeURIComponent(type)}&month=${encodeURIComponent(month)}`
      ),
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    )

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
