import { SpringBootLogoScene } from "@/components/preview/spring-boot-logo-scene";

export const metadata = {
  title: "Spring Boot 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the Spring Boot logo",
};

const SpringBootPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <SpringBootLogoScene />
    </main>
  );
};

export default SpringBootPreviewPage;
