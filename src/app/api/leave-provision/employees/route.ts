import { NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/base-path'

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') ?? ''
    const token = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/)?.[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const query = url.searchParams.toString()
    const backendPath = query ? `/api/leave-provision/employees?${query}` : '/api/leave-provision/employees'

    const res = await fetch(getBackendUrl(backendPath), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
