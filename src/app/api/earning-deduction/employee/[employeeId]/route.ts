import { NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/base-path'

type RouteContext = {
  params: Promise<{
    employeeId: string
  }>
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const cookieHeader = req.headers.get('cookie') ?? ''
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/)
    const token = tokenMatch?.[1]

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { employeeId } = await context.params
    const url = new URL(req.url)
    const query = url.searchParams.toString()

    const res = await fetch(
      getBackendUrl(
        `/api/earning-deduction/employee/${encodeURIComponent(employeeId)}${query ? `?${query}` : ''}`
      ),
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
