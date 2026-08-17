import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { removeEmployee } from '@/app/organization/mock/employees';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const { id } = await params;

    const backendUrl = getBackendUrl(`/api/organization/employees/${encodeURIComponent(id)}/unassign`);
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
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
      }
    } catch (err) {
      console.warn('Backend server fetch failed for POST unassign employee, using fallback mock handler:', err);
    }

    // Fallback mock unassign
    removeEmployee(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Employee moved to unassigned pool successfully.',
        data: { employeeId: id },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error unassigning employee:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
