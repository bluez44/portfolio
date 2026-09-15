'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    return { error: 'Admin credentials are not configured in environment variables.' };
  }

  const reqHeaders = await headers();
  const ip = reqHeaders.get('x-forwarded-for') || 'Unknown IP';
  const country = reqHeaders.get('x-vercel-ip-country') || 'Unknown Country';
  const city = reqHeaders.get('x-vercel-ip-city') || 'Unknown City';
  const userAgent = reqHeaders.get('user-agent') || 'Unknown Device';
  
  const success = username === validUsername && password === validPassword;

  try {
    await prisma.adminLoginHistory.create({
      data: {
        ip, 
        country, 
        city, 
        userAgent, 
        username, 
        success
      }
    });
  } catch (err) {
    console.error('Failed to write login history:', err);
  }

  if (success) {
    const cookieStore = await cookies();
    cookieStore.set('admin_auth', 'true', { httpOnly: true, secure: true, path: '/' });
    redirect('/admin');
  } else {
    return { error: 'Invalid username or password.' };
  }
}
