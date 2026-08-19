import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/base-path'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value
    const { clientId } = await params

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const res = await fetch(
      getBackendUrl(`/api/salary-status/${encodeURIComponent(clientId)}/lock`),
      {
        method: 'POST',
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
