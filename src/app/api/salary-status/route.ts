import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/base-path'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')

    const query = new URLSearchParams()
    if (clientId) {
      query.set('clientId', clientId)
    }

    const backendUrl = getBackendUrl('/api/salary-status')
    const finalUrl = query.toString()
      ? `${backendUrl}?${query.toString()}`
      : backendUrl

    const res = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

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
