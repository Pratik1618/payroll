import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { organizationData, OrganizationNode } from '@/app/organization/mock/organization';

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
      console.warn('Backend server fetch failed for /api/organization/tree, using fallback mock data:', err);
    }

    return NextResponse.json(
      {
        success: true,
        results: organizationData,
        data: organizationData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching org tree:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
