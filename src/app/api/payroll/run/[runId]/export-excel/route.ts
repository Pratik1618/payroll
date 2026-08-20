import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/base-path'

type RouteContext = {
  params: Promise<{
    runId: string
  }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { runId } = await context.params

    const res = await fetch(
      getBackendUrl(`/api/payroll/run/${encodeURIComponent(runId)}/export-excel`),
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      const data = await res.json().catch(() => ({ message: 'Failed to export payroll Excel' }))
      return NextResponse.json(data, { status: res.status })
    }

    const blob = await res.arrayBuffer()

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          res.headers.get('content-disposition') || `attachment; filename="Payroll_${runId}.xlsx"`,
      },
    })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
