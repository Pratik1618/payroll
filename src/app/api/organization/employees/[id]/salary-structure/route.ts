import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { updateEmployee } from '@/app/organization/mock/employees';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const { id } = await params;
    const body = await req.json();

    const backendUrl = getBackendUrl(`/api/organization/employees/${encodeURIComponent(id)}/salary-structure`);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(backendUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
      }
    } catch (err) {
      console.warn('Backend server fetch failed for PUT employee salary structure, using fallback mock handler:', err);
    }

    // Calculate gross salary from components if present
    let grossMonthly = 0;
    if (Array.isArray(body.salaryComponents)) {
      grossMonthly = body.salaryComponents.reduce((acc: number, c: any) => {
        if (c.type === 'earning') return acc + (Number(c.value) || 0);
        return acc;
      }, 0);
    }

    if (grossMonthly > 0) {
      updateEmployee(id, { monthlySalary: grossMonthly });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Employee salary structure updated successfully.',
        data: {
          employeeId: id,
          salaryComponents: body.salaryComponents || [],
          grossMonthly,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating employee salary structure:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
