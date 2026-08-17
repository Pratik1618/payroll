import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { designations } from '@/app/organization/mock/designations';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const backendUrl = getBackendUrl('/api/masters/designations');

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
      console.warn('Backend server fetch failed for /api/masters/designations, using fallback mock data:', err);
    }

    return NextResponse.json(
      {
        success: true,
        results: designations,
        data: designations,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching designations:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const body = await req.json();

    const backendUrl = getBackendUrl('/api/masters/designations');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      }
    } catch (err) {
      console.warn('Backend server fetch failed for POST /api/masters/designations, using fallback mock creator:', err);
    }

    const title = body.title || body.name || '';
    if (title && !designations.includes(title)) {
      designations.push(title);
      designations.sort((a, b) => a.localeCompare(b));
    }

    return NextResponse.json(
      {
        success: true,
        message: `Designation '${title}' added successfully.`,
        data: { title, status: 'Active' },
        results: [title],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding designation:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
