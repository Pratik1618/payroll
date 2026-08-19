import { NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/base-path'

type RouteContext = { params: Promise<{ id: string }> }

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const cookieHeader = req.headers.get('cookie') ?? ''
    const token = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/)?.[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    const res = await fetch(
      getBackendUrl(`/api/salary-cycle-mapping/${encodeURIComponent(id)}`),
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    )
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
