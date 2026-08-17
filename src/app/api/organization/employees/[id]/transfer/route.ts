import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { transferEmployee } from '@/app/organization/mock/employees';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const { id } = await params;
    const body = await req.json();

    const backendUrl = getBackendUrl(`/api/organization/employees/${encodeURIComponent(id)}/transfer`);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
      }
    } catch (err) {
      console.warn('Backend server fetch failed for POST transfer employee, using fallback mock handler:', err);
    }

    // Fallback mock transfer
    const targetNodeId = body.targetZone || body.targetSubDepartmentId || body.targetDepartmentId || 'company';
    transferEmployee(id, targetNodeId, body.targetDepartmentId || 'Department');

    return NextResponse.json(
      {
        success: true,
        message: 'Employee transferred successfully.',
        data: {
          employeeId: id,
          ...body,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error transferring employee:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
