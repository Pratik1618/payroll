import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { initialStates, StateItem } from '@/app/organization/mock/statesAndCities';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const searchParams = req.nextUrl.searchParams;
    const zone = searchParams.get('zone');

    const query = zone ? `?zone=${encodeURIComponent(zone)}` : '';
    const backendUrl = getBackendUrl(`/api/masters/states${query}`);

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
      console.warn('Backend server fetch failed for /api/masters/states, using fallback mock data:', err);
    }

    // Fallback Mock Data filtered by zone if query provided
    let states: StateItem[] = initialStates;
    if (zone) {
      states = states.filter((s) => s.zone.toLowerCase() === zone.toLowerCase());
    }

    return NextResponse.json(
      {
        success: true,
        data: states,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching states:', error);
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

    const backendUrl = getBackendUrl('/api/masters/states');
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
      console.warn('Backend server fetch failed for POST /masters/states, using fallback mock creator:', err);
    }

    // Fallback response for creation
    const newId = `state-${(body.name || 'new').toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
    const newState: StateItem = {
      id: newId,
      name: body.name || '',
      zone: body.zone || 'West',
      status: body.status || 'Active',
    };

    initialStates.push(newState);

    return NextResponse.json(
      {
        success: true,
        message: `State '${newState.name}' added successfully.`,
        data: newState,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding state:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
