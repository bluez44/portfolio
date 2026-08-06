import { TailwindCSSLogoScene } from "@/components/preview/tailwindcss-logo-scene";

export const metadata = {
  title: "Tailwind CSS 3D Logo Preview",
  description: "Interactive 3D Three.js model preview of the Tailwind CSS logo",
};

const TailwindCSSPreviewPage = () => {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#0b1120",
      }}
    >
      <TailwindCSSLogoScene />
    </main>
  );
};

export default TailwindCSSPreviewPage;
