import { isAdminSession } from '@/lib/admin-auth/session';
import VisitorList from './VisitorList';
import LoginForm from './LoginForm';
import { GuestSection } from './guests/guest-section';

export default async function AdminPage() {
  const isAuthenticated = await isAdminSession();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen p-8 bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard - Visitors</h1>
        <VisitorList />
        <GuestSection />
      </div>
    </div>
  );
}
