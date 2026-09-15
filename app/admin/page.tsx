import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import VisitorList from './VisitorList';

async function login(formData: FormData) {
  "use server"
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

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
    cookieStore.set('admin_auth', 'true', { httpOnly: true, secure: true });
    redirect('/admin');
  } else {
    redirect('/');
  }
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('admin_auth')?.value === 'true';

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <form action={login} className="flex flex-col gap-4 p-8 bg-zinc-900 rounded-lg shadow-lg w-full max-w-sm border border-zinc-800">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <input 
            name="username" 
            placeholder="Username" 
            className="p-3 bg-zinc-800 text-white rounded border border-zinc-700 outline-none focus:border-zinc-500" 
            required 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            className="p-3 bg-zinc-800 text-white rounded border border-zinc-700 outline-none focus:border-zinc-500" 
            required 
          />
          <button type="submit" className="bg-white text-black font-semibold p-3 rounded mt-2 hover:bg-gray-200 transition">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard - Visitors</h1>
        <VisitorList />
      </div>
    </div>
  );
}
