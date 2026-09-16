import { VercelLogoScene } from "@/components/preview/vercel-logo-scene";

export const metadata = {
  title: "Vercel 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the Vercel logo",
};

const VercelPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <VercelLogoScene />
    </main>
  );
};

export default VercelPreviewPage;
