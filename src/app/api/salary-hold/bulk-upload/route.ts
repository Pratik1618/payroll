import { NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/base-path'

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') ?? ''
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/)
    const token = tokenMatch?.[1]

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const incomingFormData = await req.formData()
    const outgoingFormData = new FormData()

    for (const [key, value] of incomingFormData.entries()) {
      outgoingFormData.append(key, value)
    }

    const res = await fetch(getBackendUrl('/api/salary-hold/bulk-upload'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: outgoingFormData,
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
