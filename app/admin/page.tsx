import { isAdminSession } from '@/lib/admin-auth/session';
import VisitorList from './VisitorList';
import LoginForm from './LoginForm';
import { GuestSection } from './guests/guest-section';
import { AdminNav } from './components/admin-nav';

export default async function AdminPage() {
  const isAuthenticated = await isAdminSession();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen p-8 bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <AdminNav />
        <VisitorList />
        <GuestSection />
      </div>
    </div>
  );
}
