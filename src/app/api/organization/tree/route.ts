import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const backendUrl = getBackendUrl('/api/organization/tree');

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
    console.error('Error fetching org tree:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
