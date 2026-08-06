import { ReduxLogoScene } from "@/components/preview/redux-logo-scene";

export const metadata = {
  title: "Redux 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the Redux logo",
};

const ReduxPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#f4f2fb",
      }}
    >
      <ReduxLogoScene />
    </main>
  );
};

export default ReduxPreviewPage;
