import { WebRTCLogoScene } from "@/components/preview/webrtc-logo-scene";

export const metadata = {
  title: "WebRTC 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the WebRTC logo",
};

const WebRTCPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#f4f6f8",
      }}
    >
      <WebRTCLogoScene />
    </main>
  );
};

export default WebRTCPreviewPage;
