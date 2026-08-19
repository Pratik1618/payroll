import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const body = await req.json();

    const backendUrl = getBackendUrl('/api/organization/documents/offer-letters');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error creating offer letter:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const departmentId = searchParams.get('departmentId');

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (departmentId) params.append('departmentId', departmentId);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const backendUrl = getBackendUrl(`/api/organization/documents/offer-letters${queryString}`);

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
    console.error('Error fetching offer letters:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
