import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const searchParams = req.nextUrl.searchParams;
    const nodeId = searchParams.get('nodeId');
    const status = searchParams.get('status');

    const params = new URLSearchParams();
    if (nodeId) params.append('nodeId', nodeId);
    if (status) params.append('status', status);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const backendUrl = getBackendUrl(`/api/organization/employees${queryString}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
