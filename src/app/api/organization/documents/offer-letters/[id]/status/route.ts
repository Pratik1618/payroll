import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { updateOfferStatus, OfferStatus } from '@/app/organization/mock/offerLetters';

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
      console.warn('Backend server fetch failed for PUT offer-letter status, using fallback mock handler:', err);
    }

    // Fallback mock update
    if (body.status) {
      updateOfferStatus(id, body.status as OfferStatus);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Offer letter status updated to '${body.status}'.`,
        data: {
          offerId: id,
          status: body.status,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating offer letter status:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
