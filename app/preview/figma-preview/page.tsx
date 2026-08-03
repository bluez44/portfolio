import { FigmaLogoScene } from "@/components/preview/figma-logo-scene";

export const metadata = {
  title: "Figma 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the Figma logo",
};

const FigmaPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <FigmaLogoScene />
    </main>
  );
};

export default FigmaPreviewPage;
