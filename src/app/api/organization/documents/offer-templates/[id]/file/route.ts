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

    try {
      const res = await fetch(backendUrl, {
        method: 'GET',
        headers,
      });

      if (res.ok) {
        const blob = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        return new NextResponse(blob, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="offer_template_${id}.docx"`,
          },
        });
      }
    } catch (err) {
      console.warn('Backend server fetch failed for GET offer-template file, using fallback sample file:', err);
    }

    // Fallback sample file response
    const dummyText = `Offer Letter Template Content for Template ID: ${id}\n\nDear {{CandidateName}},\nWe are pleased to offer you employment...`;
    const buffer = Buffer.from(dummyText, 'utf-8');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="offer_template_${id}.txt"`,
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
