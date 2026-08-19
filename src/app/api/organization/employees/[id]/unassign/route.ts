import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';

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

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error unassigning employee:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
