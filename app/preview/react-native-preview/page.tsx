import { ReactNativeLogoScene } from "@/components/preview/react-native-logo-scene";

export const metadata = {
  title: "React Native 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the React Native logo",
};

const ReactNativePreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#090d16",
      }}
    >
      <ReactNativeLogoScene />
    </main>
  );
};

export default ReactNativePreviewPage;
