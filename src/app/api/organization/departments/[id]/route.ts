import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { safeDeleteDepartment } from '@/app/organization/mock/organization';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const { id } = await params;
    const body = await req.json();

    const backendUrl = getBackendUrl(`/api/organization/departments/${encodeURIComponent(id)}`);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(backendUrl, {
        method: 'DELETE',
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
      }
    } catch (err) {
      console.warn('Backend server fetch failed for DELETE department, using fallback mock handler:', err);
    }

    // Fallback mock delete
    const success = safeDeleteDepartment(id, {
      employeeAction: body.employeeAction,
      targetDeptId: body.targetDeptId,
    });

    if (success) {
      return NextResponse.json(
        {
          success: true,
          message: `Department '${body.confirmName || id}' deleted successfully.`,
          data: { deletedDeptId: id },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Failed to delete department. Root organization node cannot be deleted.' },
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
