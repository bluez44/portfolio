import { NextjsLogoScene } from "@/components/preview/nextjs-logo-scene";

export const metadata = {
  title: "Next.js 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the Next.js logo",
};

const NextjsPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <NextjsLogoScene />
    </main>
  );
};

export default NextjsPreviewPage;
