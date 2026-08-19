import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const formData = await req.formData();

    const backendUrl = getBackendUrl('/api/organization/documents/offer-templates/upload');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error uploading offer template:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
