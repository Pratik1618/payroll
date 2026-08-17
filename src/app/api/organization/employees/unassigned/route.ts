import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { unassignedEmployees } from '@/app/organization/mock/employees';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const backendUrl = getBackendUrl('/api/organization/employees/unassigned');

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
      console.warn('Backend server fetch failed for /api/organization/employees/unassigned, using fallback mock pool:', err);
    }

    return NextResponse.json(
      {
        success: true,
        results: unassignedEmployees,
        data: unassignedEmployees,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching unassigned employees pool:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
