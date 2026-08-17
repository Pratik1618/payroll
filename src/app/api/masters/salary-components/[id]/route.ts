import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { initialSalaryComponentsMaster } from '@/app/organization/mock/salaryComponentsMaster';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const { id } = await params;
    const body = await req.json();

    const backendUrl = getBackendUrl(`/api/masters/salary-components/${encodeURIComponent(id)}`);
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
      console.warn('Backend server fetch failed for PUT salary component, using fallback mock handler:', err);
    }

    const idx = initialSalaryComponentsMaster.findIndex((c) => c.id === id);
    if (idx > -1) {
      initialSalaryComponentsMaster[idx] = { ...initialSalaryComponentsMaster[idx], ...body };
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Salary component updated successfully.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating salary component:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const { id } = await params;

    const backendUrl = getBackendUrl(`/api/masters/salary-components/${encodeURIComponent(id)}`);
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
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
      }
    } catch (err) {
      console.warn('Backend server fetch failed for DELETE salary component, using fallback mock handler:', err);
    }

    const idx = initialSalaryComponentsMaster.findIndex((c) => c.id === id);
    if (idx > -1) {
      initialSalaryComponentsMaster.splice(idx, 1);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Salary component deleted successfully.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting salary component:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
