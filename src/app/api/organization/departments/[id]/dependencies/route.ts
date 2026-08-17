import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { checkDepartmentDependencies } from '@/app/organization/mock/organization';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const { id } = await params;

    const backendUrl = getBackendUrl(`/api/organization/departments/${encodeURIComponent(id)}/dependencies`);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(backendUrl, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
      }
    } catch (err) {
      console.warn('Backend server fetch failed for GET department dependencies, using fallback mock inspection:', err);
    }

    // Fallback mock inspection
    const deps = checkDepartmentDependencies(id);

    return NextResponse.json(
      {
        success: true,
        data: {
          departmentId: id,
          departmentName: deps.node ? deps.node.name : 'Unknown Department',
          assignedEmployeesCount: deps.assignedEmployeesCount,
          childDepartmentsCount: deps.childDepartmentsCount,
          childDepartmentNames: deps.childDepartmentNames,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching department dependencies:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
