import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const { id } = await params;
    const body = await req.json();

    const backendUrl = getBackendUrl(`/api/organization/documents/offer-letters/${encodeURIComponent(id)}/status`);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error updating offer letter status:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
