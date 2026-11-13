import { isAdminSession } from "@/lib/admin-auth/session";
import { flattenTexts } from "@/lib/graduation/content/flatten-texts";
import { loadGraduationSettings } from "@/lib/graduation/content/load-settings";
import { guestPath } from "@/lib/graduation/guest-path";
import { guestRepository } from "@/lib/graduation/guest-repository";
import { DEFAULT_MOMENTS, DEFAULT_TEXTS } from "@/lib/graduation/i18n";
import { readOwnerPhone } from "@/lib/graduation/owner-phone";
import LoginForm from "../../LoginForm";
import { AdminShell } from "../../components/admin-shell";
import { SettingsEditor } from "./components/settings-editor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cài đặt thiệp | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminGraduationSettingsPage() {
  if (!(await isAdminSession())) return <LoginForm />;

  const [settings, guests] = await Promise.all([loadGraduationSettings(), guestRepository.list()]);

  return (
    <AdminShell
      title="Cài đặt thiệp"
      description="Nội dung chung cho mọi thiệp, nhập cả tiếng Việt và tiếng Anh. Ô để trống dùng giá trị mặc định (chữ mờ trong ô)."
    >
      <SettingsEditor
        initial={settings}
        defaults={{ vi: flattenTexts(DEFAULT_TEXTS.vi), en: flattenTexts(DEFAULT_TEXTS.en) }}
        defaultMoments={DEFAULT_MOMENTS}
        envPhone={readOwnerPhone()}
        previewHref={guests[0] ? guestPath(guests[0]) : undefined}
      />
    </AdminShell>
  );
}
