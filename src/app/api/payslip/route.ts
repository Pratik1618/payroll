import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)

    const emp_id = searchParams.get('emp_id')
    const month = searchParams.get('month')

    if (!emp_id || !month) {
      return NextResponse.json(
        { message: 'emp_id and month are required' },
        { status: 400 }
      )
    }

    // ✅ CORRECT URL (your backend format)
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payroll/history/payslip/${emp_id}?month=${month}`

    console.log('Payslip API:', url)

    const res = await fetch(url, {
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