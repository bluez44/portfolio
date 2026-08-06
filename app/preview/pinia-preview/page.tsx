import { PiniaLogoScene } from "@/components/preview/pinia-logo-scene";

export const metadata = {
  title: "Pinia 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the Pinia logo",
};

const PiniaPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#fcfcfc",
      }}
    >
      <PiniaLogoScene />
    </main>
  );
};

export default PiniaPreviewPage;
