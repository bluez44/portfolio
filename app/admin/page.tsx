import { cookies } from 'next/headers';
import VisitorList from './VisitorList';
import LoginForm from './LoginForm';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('admin_auth')?.value === 'true';

  if (!isAuthenticated) {
    return <LoginForm />;
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
