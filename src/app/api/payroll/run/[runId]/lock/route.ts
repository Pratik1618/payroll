import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/base-path'

type RouteContext = {
  params: Promise<{
    runId: string
  }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { runId } = await context.params
    const body = await req.json().catch(() => ({}))

    const res = await fetch(
      getBackendUrl(`/api/payroll/run/${encodeURIComponent(runId)}/lock`),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirmed: true, ...body }),
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
