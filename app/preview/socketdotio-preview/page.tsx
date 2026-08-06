import { SocketIOLogoScene } from "@/components/preview/socketdotio-logo-scene";

export const metadata = {
  title: "Socket.IO 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the Socket.IO logo",
};

const SocketIOPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#f0f0f0",
      }}
    >
      <SocketIOLogoScene />
    </main>
  );
};

export default SocketIOPreviewPage;
