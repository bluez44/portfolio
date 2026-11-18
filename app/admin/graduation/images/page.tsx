import { isAdminSession } from "@/lib/admin-auth/session";
import LoginForm from "../../LoginForm";
import { AdminShell } from "../../components/admin-shell";
import { MediaManager } from "./components/media-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quản lý hình ảnh Lễ tốt nghiệp | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminGraduationImagesPage() {
  if (!(await isAdminSession())) {
    return <LoginForm />;
  }

  return (
    <AdminShell
      title="Thư viện & Quản lý ảnh Lễ tốt nghiệp"
      description="Quản lý toàn bộ ảnh đã upload lên Vercel Blob cho sự kiện tốt nghiệp. Xem ảnh đang được sử dụng cho khách mời nào, ở phần nào (ảnh bìa, ảnh chụp chung, kỷ niệm), sao chép liên kết hoặc xóa ảnh không dùng."
    >
      <MediaManager />
    </AdminShell>
  );
}
