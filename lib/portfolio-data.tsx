import { ReactLogoModel } from "@/components/preview/react-logo-model";
import { TypeScriptLogoModel } from "@/components/preview/typescript-logo-model";
import { NextjsLogoModel } from "@/components/preview/nextjs-logo-model";
import { VuejsLogoModel } from "@/components/preview/vuejs-logo-model";
import { NuxtLogoModel } from "@/components/preview/nuxt-logo-model";
import { NestJSLogoModel } from "@/components/preview/nestjs-logo-model";
import { ReactNativeLogoModel } from "@/components/preview/react-native-logo-model";
import { SpringBootLogoModel } from "@/components/preview/spring-boot-logo-model";
import { NodeJSLogoModel } from "@/components/preview/nodejs-logo-model";
import { TailwindCSSLogoModel } from "@/components/preview/tailwindcss-logo-model";
import { ExpoLogoModel } from "@/components/preview/expo-logo-model";
import { ReduxLogoModel } from "@/components/preview/redux-logo-model";
import { PiniaLogoModel } from "@/components/preview/pinia-logo-model";
import { SocketIOLogoModel } from "@/components/preview/socketio-logo-model";
import { PostgresqlLogoModel } from "@/components/preview/postgresql-logo-model";
import { FigmaLogoModel } from "@/components/preview/figma-logo-model";
import { JavaLogoModel } from "@/components/preview/java-logo-model";

export interface NavLink {
  label: string;
  href: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface TechItem {
  tier: 0 | 1 | 2;
  label: string;
  desc: string;
  prof: number;
  profLabel: string;
  years: string;
  component?: React.ReactNode;
}

export interface Project {
  title: string;
  desc: string;
  tags: string[];
}

export interface Role {
  position: string;
  company: string;
  dates: string;
  points: string[];
}

export interface EducationEntry {
  degree: string;
  school: string;
  dates: string;
  note: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export interface SocialLink {
  label: string;
  value: string;
  href: string;
}

export interface AboutIntroPanel {
  kicker: string;
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  body?: string[];
  stats?: Stat[];
}

export const ACCENT_COLOR = "#EF4E2B";

export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export const stats: Stat[] = [
  { value: "1+", label: "Years of experience" },
];

export const aboutPanels: AboutIntroPanel[] = [
  {
    kicker: "Snapshot",
    title: "A little about me",
    description:
      "Hi, I'm Vo Le Quang Vinh (Tom), an HCMUT (Bach Khoa) alumnus and a software engineer specializing in the JS/TS ecosystem (React, Vue.js, NestJS, React Native). I love bridging the gap between robust system architecture and seamless, modern UI/UX design. I am passionate about engineering high-performance applications that don't compromise on technical depth or visual appeal. My experience spans challenging domains, most notably developing TrackNest, a real-time location tracking and SOS emergency platform utilizing background tasks and gRPC.",
    image: {
      src: "/portrait.jpg",
      alt: "Picture of the author",
      width: 400,
      height: 400,
    },
  },
  {
    kicker: "Direction",
    title: "What I focus on now",
    description: "",
    image: {
      src: "/portrait.jpg",
      alt: "Picture of the author",
      width: 400,
      height: 400,
    },
    body: [
      "Frontend-focused roles in a product team",
      "Turning full-stack depth into better UX decisions",
      "Shipping clean, maintainable UI systems",
    ],
  },
  {
    kicker: "Metrics",
    title: "Selected stats",
    description: "",
    image: {
      src: "/portrait.jpg",
      alt: "Picture of the author",
      width: 400,
      height: 400,
    },
    stats: stats,
  },
];

export const tierNames = ["Languages", "Frameworks", "Tools / DevOps"] as const;

export const tierLegend = [
  { kicker: "Tier 03", name: "Tools / DevOps" },
  { kicker: "Tier 02", name: "Frameworks" },
  { kicker: "Tier 01", name: "Languages · foundations" },
];

export const techs: TechItem[] = [
  // ── Tier 0 — Languages (foundations) ────────────────────────────────────
  {
    tier: 0,
    label: "TypeScript",
    desc: "My primary language across every project — type-safe React, NestJS APIs, and shared domain models.",
    prof: 92,
    profLabel: "Expert",
    years: "2+ yrs",
    component: <TypeScriptLogoModel scale={0.4} />,
  },
  {
    tier: 0,
    label: "JavaScript",
    desc: "Deep understanding of the runtime, closures, async/await patterns, and ES2024+ features.",
    prof: 95,
    profLabel: "Expert",
    years: "3+ yrs",
    component: <ReactLogoModel scale={0.4} />,
  },
  {
    tier: 0,
    label: "Java",
    desc: "Solid fundamentals for backend work — used in Spring Boot microservices and gRPC services.",
    prof: 60,
    profLabel: "Proficient",
    years: "1 yr",
    component: <JavaLogoModel scale={0.4} />,
  },

  // ── Tier 1 — Frameworks ──────────────────────────────────────────────────
  {
    tier: 1,
    label: "React.js",
    desc: "My everyday UI toolkit — hooks, custom state patterns, performance optimisation, and component libraries.",
    prof: 93,
    profLabel: "Expert",
    years: "2+ yrs",
    component: <ReactLogoModel scale={0.4} />,
  },
  {
    tier: 1,
    label: "Next.js",
    desc: "Go-to for production web apps — App Router, SSR/SSG, API routes, and edge deployments.",
    prof: 88,
    profLabel: "Expert",
    years: "1.5 yrs",
    component: <NextjsLogoModel scale={0.4} />,
  },
  {
    tier: 1,
    label: "Vue.js",
    desc: "Composition API, Pinia state management, and enterprise feature delivery at TalentGetGo.",
    prof: 82,
    profLabel: "Advanced",
    years: "1 yr",
    component: <VuejsLogoModel scale={0.4} />,
  },
  {
    tier: 1,
    label: "Nuxt",
    desc: "SSR Vue apps with file-based routing, auto-imports, and server middleware for BFF patterns.",
    prof: 78,
    profLabel: "Advanced",
    years: "1 yr",
    component: <NuxtLogoModel scale={0.4} />,
  },
  {
    tier: 1,
    label: "React Native",
    desc: "Cross-platform mobile apps — background location tracking, SOS flows, and Google Maps integration.",
    prof: 85,
    profLabel: "Advanced",
    years: "1.5 yrs",
    component: <ReactNativeLogoModel scale={0.4} />,
  },
  {
    tier: 1,
    label: "Expo",
    desc: "Managed workflow for React Native — OTA updates, Expo Router, and native module bridging.",
    prof: 80,
    profLabel: "Advanced",
    years: "1 yr",
    component: <ExpoLogoModel scale={0.4} />,
  },
  {
    tier: 1,
    label: "NestJS",
    desc: "Modular Node.js backend framework — built REST APIs and a Socket.io signaling server for HandFight.",
    prof: 78,
    profLabel: "Advanced",
    years: "1 yr",
    component: <NestJSLogoModel scale={0.4} />,
  },
  {
    tier: 1,
    label: "Node.js",
    desc: "Event-driven server runtime powering Express, NestJS, and real-time WebSocket services.",
    prof: 82,
    profLabel: "Advanced",
    years: "2 yrs",
    component: <NodeJSLogoModel scale={0.4} />,
  },
  {
    tier: 1,
    label: "Spring Boot",
    desc: "Java microservices with REST APIs, Spring Security, and integration into gRPC-based platforms.",
    prof: 60,
    profLabel: "Proficient",
    years: "1 yr",
    component: <SpringBootLogoModel scale={0.4} />,
  },

  // ── Tier 2 — Tools / DevOps ─────────────────────────────────────────────
  {
    tier: 2,
    label: "Tailwind CSS",
    desc: "Utility-first styling for rapid, consistent, and fully responsive UI across all projects.",
    prof: 90,
    profLabel: "Expert",
    years: "2 yrs",
    component: <TailwindCSSLogoModel scale={0.4} />,
  },
  {
    tier: 2,
    label: "Redux",
    desc: "Predictable global state with Redux Toolkit — managed complex multi-step UI workflows at TMA Solutions.",
    prof: 75,
    profLabel: "Advanced",
    years: "1 yr",
    component: <ReduxLogoModel scale={0.4} />,
  },
  {
    tier: 2,
    label: "Pinia",
    desc: "Vue's intuitive store — designed scalable state architecture at TalentGetGo with seamless API integration.",
    prof: 78,
    profLabel: "Advanced",
    years: "1 yr",
    component: <PiniaLogoModel scale={0.4} />,
  },
  {
    tier: 2,
    label: "Socket.io",
    desc: "Real-time bidirectional events — built the signaling server and live game-state relay for HandFight.",
    prof: 72,
    profLabel: "Advanced",
    years: "0.5 yrs",
    component: <SocketIOLogoModel scale={0.4} />,
  },
  {
    tier: 2,
    label: "PostgreSQL",
    desc: "Primary relational database — complex queries, indexing strategies, and data modelling for production apps.",
    prof: 70,
    profLabel: "Proficient",
    years: "1 yr",
    component: <PostgresqlLogoModel scale={0.4} />,
  },
  {
    tier: 2,
    label: "Figma",
    desc: "Design handoff, prototyping, and building component libraries that translate 1-to-1 into React code.",
    prof: 75,
    profLabel: "Advanced",
    years: "2 yrs",
    component: <FigmaLogoModel scale={0.4} />,
  },
];

export const chipTiers = tierNames.map((name, tierIndex) => ({
  name,
  items: techs
    .map((tech, index) => ({ ...tech, index }))
    .filter((tech) => tech.tier === tierIndex)
    .map((tech) => ({ label: tech.label, index: tech.index })),
}));

export const projects: Project[] = [
  {
    title: "TrackNest",
    desc: "An event-driven, microservices-based safety platform with real-time background location tracking, SOS emergency response, and anomaly detection. Built a React Native mobile app and Next.js web dashboard integrated via API Gateway, gRPC, and Kafka event streams.",
    tags: ["React Native", "Next.js", "Expo", "gRPC", "Spring Boot", "Google Maps API"],
  },
  {
    title: "HandFight",
    desc: "A web-based multiplayer fighting game with real-time hand-tracking controls powered by MediaPipe. Features ultra-low latency P2P gameplay via WebRTC (PeerJS), with a NestJS + Socket.io signaling server for room creation and matchmaking.",
    tags: ["React", "NestJS", "WebRTC", "Socket.io", "MediaPipe", "Tailwind CSS"],
  },
];

const roleRotations = [-2.2, 1.9, -1.7, 2.4];
const baseRoles: Role[] = [
  {
    position: "Front-end Developer",
    company: "TalentGetGo",
    dates: "02/2026 — 06/2026",
    points: [
      "Built and optimized platform features utilizing React.js and Nuxt, delivering high-performance and responsive user interfaces.",
      "Designed and implemented scalable global state management with Pinia, ensuring seamless data flow and efficient RESTful API integrations.",
      "Leveraged AI assistants (GitHub Copilot, OpenCode) to reverse-engineer legacy logic, significantly accelerating code refactoring and improving overall maintainability.",
      "Collaborated within an Agile environment to establish UI/UX and coding best practices, ensuring the continuous delivery of platform features.",
    ],
  },
  {
    position: "Front-end Developer Intern",
    company: "TMA Solutions",
    dates: "06/2025 — 09/2025",
    points: [
      "Developed and maintained internal and customer web using React.js, collaborating closely with senior engineers to deliver functional UIs.",
      "Implemented API integrations and managed complex application state utilizing Redux to ensure consistent data flow across components.",
      "Engineered automated workflows and integrated custom n8n/chat components, effectively streamlining internal operational tasks.",
      "Participated actively in enterprise Agile workflows, including daily stand-ups and sprint reviews, to align with continuous integration pipelines.",
    ],
  },
];

export const roles: (Role & {
  rotation: number;
  align: "flex-start" | "flex-end";
})[] = baseRoles.map((role, index) => ({
  ...role,
  rotation: roleRotations[index % roleRotations.length],
  align: index % 2 ? "flex-end" : "flex-start",
}));

export const education: EducationEntry[] = [
  {
    degree: "Bachelor of Computer Science",
    school: "VNUHCM - Ho Chi Minh University of Technology (HCMUT)",
    dates: "2022 — 2026",
    note: "GPA: 3.3 / 4.0",
  },
];

export const certifications: Certification[] = [
  {
    name: "Certified Junior React Developer",
    issuer: "Certificates.dev",
    year: "2026",
  },
  {
    name: "Software Development with Scrum",
    issuer: "Axon Active Vietnam",
    year: "2025",
  },
  {
    name: "TOEIC Listening & Reading — 880",
    issuer: "IIG Vietnam",
    year: "2026",
  },
];

export const socials: SocialLink[] = [
  {
    label: "Email",
    value: "vlqvinh444@gmail.com",
    href: "mailto:vlqvinh444@gmail.com",
  },
  {
    label: "GitHub",
    value: "github.com/bluez44",
    href: "https://github.com/bluez44",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/vinh-quang-485331286",
    href: "https://www.linkedin.com/in/vinh-quang-485331286",
  },
];
