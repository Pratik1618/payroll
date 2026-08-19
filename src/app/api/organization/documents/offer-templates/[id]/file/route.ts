import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const { id } = await params;

    const backendUrl = getBackendUrl(`/api/organization/documents/offer-templates/${encodeURIComponent(id)}/file`);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ message: `Backend returned ${res.status}` }));
      return NextResponse.json(data, { status: res.status });
    }

    const blob = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="offer_template_${id}.docx"`,
      },
    });
  } catch (error: any) {
    console.error('Error downloading offer template file:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
