import { PostgresqlLogoScene } from "@/components/preview/postgresql-logo-scene";

export const metadata = {
  title: "PostgreSQL 3D Logo Preview",
  description:
    "Interactive 3D Three.js model preview of the PostgreSQL Elephant logo",
};

const PostgresqlPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <PostgresqlLogoScene />
    </main>
  );
};

export default PostgresqlPreviewPage;
