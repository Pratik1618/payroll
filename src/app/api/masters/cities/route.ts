import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/base-path';
import { initialCities, CityItem } from '@/app/organization/mock/statesAndCities';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const searchParams = req.nextUrl.searchParams;
    const stateId = searchParams.get('stateId');

    const query = stateId ? `?stateId=${encodeURIComponent(stateId)}` : '';
    const backendUrl = getBackendUrl(`/api/masters/cities${query}`);

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
      console.warn('Backend server fetch failed for /api/masters/cities, using fallback mock data:', err);
    }

    // Fallback Mock Data filtered by stateId if provided
    let cities: CityItem[] = initialCities;
    if (stateId) {
      cities = cities.filter((c) => c.stateId === stateId);
    }

    return NextResponse.json(
      {
        success: true,
        results: cities,
        data: cities,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching cities:', error);
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

    const backendUrl = getBackendUrl('/api/masters/cities');
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
      console.warn('Backend server fetch failed for POST /api/masters/cities, using fallback mock creator:', err);
    }

    // Fallback response for creation
    const newId = `city-${(body.name || 'new').toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
    const newCity: CityItem = {
      id: newId,
      name: body.name || '',
      stateId: body.stateId || '',
      stateName: body.stateName || '',
      status: body.status || 'Active',
    };

    initialCities.push(newCity);

    return NextResponse.json(
      {
        success: true,
        message: `City '${newCity.name}' added successfully.`,
        data: newCity,
        results: [newCity],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding city:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}
