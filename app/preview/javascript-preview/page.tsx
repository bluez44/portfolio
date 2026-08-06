import { JavascriptLogoScene } from "@/components/preview/javascript-logo-scene";

export const metadata = {
  title: "JavaScript 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the JavaScript logo",
};

const JavascriptPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <JavascriptLogoScene />
    </main>
  );
};

export default JavascriptPreviewPage;
