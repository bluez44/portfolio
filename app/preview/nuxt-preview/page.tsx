import { NuxtLogoScene } from "@/components/preview/nuxt-logo-scene";

export const metadata = {
  title: "Nuxt 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the Nuxt logo",
};

const NuxtPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <NuxtLogoScene />
    </main>
  );
};

export default NuxtPreviewPage;
