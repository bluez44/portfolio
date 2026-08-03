import { VuejsLogoScene } from "@/components/preview/vuejs-logo-scene";

export const metadata = {
  title: "Vue.js 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the Vue.js logo",
};

const VuejsPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <VuejsLogoScene />
    </main>
  );
};

export default VuejsPreviewPage;
