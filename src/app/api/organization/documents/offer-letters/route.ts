import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { addOfferLetter, getOfferLetters, OfferLetter } from '@/app/organization/mock/offerLetters';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const body = await req.json();

    const backendUrl = getBackendUrl('/api/organization/documents/offer-letters');
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
      console.warn('Backend server fetch failed for POST offer-letters, using fallback mock creator:', err);
    }

    // Fallback mock offer letter creation
    const newOffer = addOfferLetter({
      candidateName: body.candidateName || '',
      candidateEmail: body.candidateEmail || '',
      designation: body.designation || '',
      departmentId: body.department || 'company',
      departmentName: body.departmentName || body.department || 'Department',
      ctc: body.ctc || 600000,
      monthlyCtc: Math.round((body.ctc || 600000) / 12),
      status: body.status || 'Sent',
      salaryComponents: body.salaryComponents || [],
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Offer letter created successfully.',
        data: newOffer,
        results: [newOffer],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating offer letter:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const departmentId = searchParams.get('departmentId');

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (departmentId) params.append('departmentId', departmentId);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const backendUrl = getBackendUrl(`/api/organization/documents/offer-letters${queryString}`);

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
      console.warn('Backend server fetch failed for GET offer-letters, using fallback mock data:', err);
    }

    let items = getOfferLetters();
    if (status && status !== 'ALL') {
      items = items.filter((o) => o.status.toLowerCase() === status.toLowerCase());
    }
    if (departmentId && departmentId !== 'ALL') {
      items = items.filter((o) => o.departmentId === departmentId);
    }

    return NextResponse.json(
      {
        success: true,
        results: {
          data: items,
          meta: {
            total: items.length,
            kpi: {
              totalIssued: items.length,
              awaitingResponse: items.filter((o) => o.status === 'Pending' || o.status === 'Sent').length,
              accepted: items.filter((o) => o.status === 'Accepted').length,
              joined: items.filter((o) => o.status === 'Joined').length,
              declinedOrExpired: items.filter((o) => o.status === 'Declined' || o.status === 'Expired').length,
              totalCtcOffered: items.reduce((acc, o) => acc + o.ctc, 0).toString(),
            },
          },
        },
        data: items,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching offer letters:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
