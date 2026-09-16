import { ClaudeLogoScene } from "@/components/preview/claude-logo-scene";

export const metadata = {
  title: "Claude 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the Claude logo",
};

const ClaudePreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <ClaudeLogoScene />
    </main>
  );
};

export default ClaudePreviewPage;
