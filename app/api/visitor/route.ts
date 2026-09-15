import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'Unknown IP';
  
  const country = request.headers.get('x-vercel-ip-country') || 'Unknown Country';
  const city = request.headers.get('x-vercel-ip-city') || 'Unknown City';
  
  const userAgent = request.headers.get('user-agent') || 'Unknown Device';

  return NextResponse.json({
    ip,
    location: `${city}, ${country}`,
    device: userAgent
  });
}