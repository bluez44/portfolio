import { isAdminSession } from "@/lib/admin-auth/session";
import LoginForm from "../../LoginForm";
import { AdminShell } from "../../components/admin-shell";
import { MediaManager } from "./components/media-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Thư viện ảnh tốt nghiệp | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminGraduationMediaPage() {
  if (!(await isAdminSession())) {
    return <LoginForm />;
  }

  return (
    <AdminShell
      title="Thư viện ảnh đã tải lên"
      description="Quản lý toàn bộ ảnh đã upload lên Vercel Blob cho sự kiện tốt nghiệp. Bạn có thể xem trước, sao chép liên kết, xóa ảnh không dùng hoặc tải nhiều ảnh mới cùng lúc."
    >
      <MediaManager />
    </AdminShell>
  );
}
