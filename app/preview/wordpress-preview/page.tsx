import { WordpressLogoScene } from "@/components/preview/wordpress-logo-scene";

export const metadata = {
  title: "WordPress 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the WordPress logo",
};

const WordpressPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <WordpressLogoScene />
    </main>
  );
};

export default WordpressPreviewPage;
