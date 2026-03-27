import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)

    const month = searchParams.get('month')
    const client_id = searchParams.get('client_id')
    const site_id = searchParams.get('site_id')
    const emp_id = searchParams.get('emp_id')

    // 🔥 Build query (ONLY include optional if present)
    const query = new URLSearchParams()

    // ✅ Mandatory
    if (!month) {
      return NextResponse.json(
        { message: 'Month is required' },
        { status: 400 }
      )
    }

    query.append('month', month)

    // ✅ Optional
    if (client_id) query.append('client_id', client_id)
    if (site_id) query.append('site_id', site_id)
    if (emp_id) query.append('emp_id', emp_id)

    const finalUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payroll/history?${query.toString()}`

    console.log('Calling Backend:', finalUrl)

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
      { message: error.message },
      { status: 500 }
    )
  }
}