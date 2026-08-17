import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { designations } from '@/app/organization/mock/designations';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ title: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const { title } = await params;
    const decodedTitle = decodeURIComponent(title);

    const backendUrl = getBackendUrl(`/api/masters/designations/${encodeURIComponent(title)}`);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(backendUrl, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
      }
    } catch (err) {
      console.warn('Backend server fetch failed for DELETE designation, using fallback mock handler:', err);
    }

    const idx = designations.findIndex((d) => d.toLowerCase() === decodedTitle.toLowerCase());
    if (idx > -1) {
      designations.splice(idx, 1);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Designation '${decodedTitle}' removed.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting designation:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
