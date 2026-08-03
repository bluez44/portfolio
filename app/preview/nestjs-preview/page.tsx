import { NestJSLogoScene } from "@/components/preview/nestjs-logo-scene";

const page = () => {
  return (
    <main style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <NestJSLogoScene />
    </main>
  );
};

export default page;
