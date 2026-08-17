import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { updateNodeZones } from '@/app/organization/mock/organization';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const { id } = await params;
    const body = await req.json();

    const backendUrl = getBackendUrl(`/api/organization/departments/${encodeURIComponent(id)}/zones`);
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
      console.warn('Backend server fetch failed for PUT covered zones, using fallback mock handler:', err);
    }

    // Fallback mock update
    if (body.coveredZones) {
      updateNodeZones(id, body.coveredZones);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Covered zones updated successfully.',
        data: {
          departmentId: id,
          coveredZones: body.coveredZones || [],
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating covered zones:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
