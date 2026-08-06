import { ExpoLogoScene } from "@/components/preview/expo-logo-scene";

export const metadata = {
  title: "Expo 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the Expo logo",
};

const ExpoPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#f0f2f5",
      }}
    >
      <ExpoLogoScene />
    </main>
  );
};

export default ExpoPreviewPage;
