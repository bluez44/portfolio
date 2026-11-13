import { isAdminSession } from "@/lib/admin-auth/session";
import LoginForm from "../LoginForm";
import { AdminShell } from "../components/admin-shell";
import { guestRepository } from "@/lib/graduation/guest-repository";
import { guestPlaceholders } from "@/lib/graduation/content/guest-placeholders";
import { loadGraduationSettings } from "@/lib/graduation/content/load-settings";
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

  const [guests, settings] = await Promise.all([guestRepository.list(), loadGraduationSettings()]);

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
      <GraduationManager initialGuests={guests} placeholders={guestPlaceholders(settings)} />
    </AdminShell>
  );
}
