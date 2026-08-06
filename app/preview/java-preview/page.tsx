import { JavaLogoScene } from "@/components/preview/java-logo-scene";

export const metadata = {
  title: "Java 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the Java logo",
};

const JavaPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <JavaLogoScene />
    </main>
  );
};

export default JavaPreviewPage;
