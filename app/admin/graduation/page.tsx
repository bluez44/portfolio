import { isAdminSession } from "@/lib/admin-auth/session";
import LoginForm from "../LoginForm";
import { AdminNav } from "../components/admin-nav";
import { guestRepository } from "@/lib/graduation/guest-repository";
import { GraduationManager } from "./components/graduation-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quản lý Lễ tốt nghiệp | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminGraduationPage() {
  const isAuthenticated = await isAdminSession();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const guests = await guestRepository.list();

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-white sm:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Hệ thống quản trị và phân phối thiệp mời Lễ tốt nghiệp
          </p>
        </div>

        <AdminNav />

        <div className="mb-6 flex flex-col gap-1">
          <h2 className="text-xl font-bold text-zinc-100">
            Danh sách khách mời & Tùy biến thiệp
          </h2>
          <p className="text-xs text-zinc-400">
            Tạo link cá nhân hóa dạng <code className="text-sky-300">graduation/{`{guest_id}`}</code>,
            tùy biến bìa thiệp, kỷ niệm, thời gian và địa điểm riêng cho từng người.
          </p>
        </div>

        <GraduationManager initialGuests={guests} />
      </div>
    </div>
  );
}
