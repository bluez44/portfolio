import { isAdminSession } from "@/lib/admin-auth/session";
import LoginForm from "../LoginForm";
import { AdminShell } from "../components/admin-shell";
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
    <AdminShell
      title="Danh sách khách mời & Tùy biến thiệp"
      description={
        <>
          Tạo link cá nhân hóa dạng <code className="text-sky-300">graduation/{`{guest_id}`}</code>, tùy biến bìa thiệp, kỷ niệm, thời gian
          và địa điểm riêng cho từng người.
        </>
      }
    >
      <GraduationManager initialGuests={guests} />
    </AdminShell>
  );
}
