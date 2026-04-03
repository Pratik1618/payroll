import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/base-path'

type RouteContext = {
  params: Promise<{
    clientId: string
  }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { clientId } = await context.params

    const res = await fetch(
      getBackendUrl(`/api/clients/${encodeURIComponent(clientId)}/sites`),
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
