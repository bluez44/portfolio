import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

// Fetch all visitors (Admin only)
export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin_auth')?.value === 'true';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const visitors = await prisma.userStats.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });
    return NextResponse.json(visitors);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create a new visitor record
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const country = request.headers.get('x-vercel-ip-country') || 'Unknown Country';
  const city = request.headers.get('x-vercel-ip-city') || 'Unknown City';
  const userAgent = request.headers.get('user-agent') || 'Unknown Device';

  try {
    const lastVisit = await prisma.userStats.findFirst({
      where: { ip },
      orderBy: { createdAt: 'desc' }
    });

    let shouldCreate = false;

    if (!lastVisit) {
      shouldCreate = true;
    } else {
      const now = new Date();
      const lastVisitDate = new Date(lastVisit.createdAt);
      
      const isDifferentDay = now.toISOString().split('T')[0] !== lastVisitDate.toISOString().split('T')[0];
      const diffMs = now.getTime() - lastVisitDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (isDifferentDay && diffHours >= 2) {
        shouldCreate = true;
      }
    }

    if (shouldCreate) {
      const newVisitor = await prisma.userStats.create({
        data: {
          ip,
          country,
          city,
          userAgent
        }
      });
      return NextResponse.json(newVisitor, { status: 201 });
    }

    return NextResponse.json({ message: 'Visit already recorded recently' }, { status: 200 });
  } catch (error) {
    console.error('Error creating visitor record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}