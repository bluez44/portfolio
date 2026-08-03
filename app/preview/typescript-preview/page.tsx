import { TypeScriptLogoScene } from "@/components/preview/typescript-logo-scene";

export const metadata = {
  title: "TypeScript 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the TypeScript logo",
};

const TypeScriptPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <TypeScriptLogoScene />
    </main>
  );
};

export default TypeScriptPreviewPage;
