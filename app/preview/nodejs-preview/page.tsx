import { NodeJSLogoScene } from "@/components/preview/nodejs-logo-scene";

export const metadata = {
  title: "NodeJS 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the NodeJS logo",
};

const NodejsPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <NodeJSLogoScene />
    </main>
  );
};

export default NodejsPreviewPage;
