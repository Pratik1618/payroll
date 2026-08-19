import { NextRequest, NextResponse } from 'next/server'

// This route is the one exception to getBackendUrl()'s single BASE_URL: it's
// client/master data owned by the *commercial* service, not payroll, so it
// must hit a different backend host regardless of what BASE_URL points at.
const COMMERCIAL_BASE_URL =
  process.env.COMMERCIAL_API_BASE_URL || 'http://smarterp-app-svc.smarterp.svc.cluster.local'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const res = await fetch(`${COMMERCIAL_BASE_URL}/api/commercial/clients/lookup`, {
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
