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

export const ACCENT_COLOR = "#3D8BFF";

export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export const stats: Stat[] = [
  { value: "1+", label: "Years of experience" },
  // { value: "[XX]+", label: "Projects completed" },
  // { value: "[XX]", label: "Happy clients / teams" },
];

export const aboutPanels: AboutIntroPanel[] = [
  {
    kicker: "Snapshot",
    title: "A little about me",
    description:
      "Hi, I\'m Vo Le Quang Vinh (Tom), an HCMUT (Bach Khoa) alumnus and a software engineer specializing in the JS/TS ecosystem (React, Vue.js, NestJS, React Native). I love bridging the gap between robust system architecture and seamless, modern UI/UX design. I am passionate about engineering high-performance applications that don\'t compromise on technical depth or visual appeal, strictly adhering to SOLID principles. My experience spans challenging domains, most notably developing TrackNest, a real-time location tracking and SOS emergency platform utilizing background tasks and gRPC, as well as building AI-driven Intelligent Tutoring Systems.",
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
  {
    tier: 0,
    label: "[Tech 1]",
    desc: "[One-line description of how you use this language and where it shines in your work.]",
    prof: 90,
    profLabel: "[Expert]",
    years: "[X] yrs",
  },
  {
    tier: 0,
    label: "[Tech 2]",
    desc: "[One-line description of how you use this language.]",
    prof: 85,
    profLabel: "[Advanced]",
    years: "[X] yrs",
  },
  {
    tier: 0,
    label: "[Tech 3]",
    desc: "[One-line description of how you use this language.]",
    prof: 75,
    profLabel: "[Advanced]",
    years: "[X] yrs",
  },
  {
    tier: 0,
    label: "[Tech 4]",
    desc: "[One-line description of how you use this language.]",
    prof: 65,
    profLabel: "[Proficient]",
    years: "[X] yrs",
  },
  {
    tier: 1,
    label: "[Tech 5]",
    desc: "[One-line description of how you use this framework and typical projects built with it.]",
    prof: 88,
    profLabel: "[Expert]",
    years: "[X] yrs",
  },
  {
    tier: 1,
    label: "[Tech 6]",
    desc: "[One-line description of how you use this framework.]",
    prof: 80,
    profLabel: "[Advanced]",
    years: "[X] yrs",
  },
  {
    tier: 1,
    label: "[Tech 7]",
    desc: "[One-line description of how you use this framework.]",
    prof: 72,
    profLabel: "[Proficient]",
    years: "[X] yrs",
  },
  {
    tier: 1,
    label: "[Tech 8]",
    desc: "[One-line description of how you use this framework.]",
    prof: 68,
    profLabel: "[Proficient]",
    years: "[X] yrs",
  },
  {
    tier: 2,
    label: "[Tech 9]",
    desc: "[One-line description of how you use this tool in your delivery pipeline.]",
    prof: 82,
    profLabel: "[Advanced]",
    years: "[X] yrs",
  },
  {
    tier: 2,
    label: "[Tech 10]",
    desc: "[One-line description of how you use this tool.]",
    prof: 70,
    profLabel: "[Proficient]",
    years: "[X] yrs",
  },
  {
    tier: 2,
    label: "[Tech 11]",
    desc: "[One-line description of how you use this tool.]",
    prof: 60,
    profLabel: "[Familiar]",
    years: "[X] yrs",
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
    title: "[Project Title 1]",
    desc: "[Short description — what the project does, who it serves, and one impressive technical detail.]",
    tags: ["[Tag]", "[Tag]", "[Tag]"],
  },
  {
    title: "[Project Title 2]",
    desc: "[Short description — what the project does and the problem it solves.]",
    tags: ["[Tag]", "[Tag]"],
  },
  {
    title: "[Project Title 3]",
    desc: "[Short description — highlight measurable impact if possible.]",
    tags: ["[Tag]", "[Tag]", "[Tag]"],
  },
  {
    title: "[Project Title 4]",
    desc: "[Short description — what the project does and your specific role.]",
    tags: ["[Tag]", "[Tag]"],
  },
  {
    title: "[Project Title 5]",
    desc: "[Short description — a side project or open-source contribution.]",
    tags: ["[Tag]", "[Tag]", "[Tag]"],
  },
  {
    title: "[Project Title 6]",
    desc: "[Short description — an experiment, tool, or library you built.]",
    tags: ["[Tag]", "[Tag]"],
  },
];

const roleRotations = [-2.2, 1.9, -1.7, 2.4];
const baseRoles: Role[] = [
  {
    position: "[Position — e.g. Senior Engineer]",
    company: "[Company 1]",
    dates: "[2024 — Present]",
    points: [
      "[Key achievement with a measurable outcome.]",
      "[Second achievement — scope, team size, or technology led.]",
      "[Third achievement — shipped feature, system, or improvement.]",
    ],
  },
  {
    position: "[Position]",
    company: "[Company 2]",
    dates: "[2022 — 2024]",
    points: [
      "[Key achievement with a measurable outcome.]",
      "[Second achievement.]",
    ],
  },
  {
    position: "[Position]",
    company: "[Company 3]",
    dates: "[2020 — 2022]",
    points: ["[Key achievement.]", "[Second achievement.]"],
  },
  {
    position: "[Position — e.g. Junior Developer]",
    company: "[Company 4]",
    dates: "[2018 — 2020]",
    points: ["[Where it all started — first role, core skills built.]"],
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
    degree: "[Degree — e.g. B.Sc. Computer Science]",
    school: "[University Name]",
    dates: "[2014 — 2018]",
    note: "[Optional note — honors, thesis topic, relevant coursework.]",
  },
  {
    degree: "[Degree or Program]",
    school: "[Institution Name]",
    dates: "[Year]",
    note: "[Optional note.]",
  },
];

export const certifications: Certification[] = [
  {
    name: "[Certification 1]",
    issuer: "[Issuing organization]",
    year: "[Year]",
  },
  {
    name: "[Certification 2]",
    issuer: "[Issuing organization]",
    year: "[Year]",
  },
  {
    name: "[Certification 3]",
    issuer: "[Issuing organization]",
    year: "[Year]",
  },
  { name: "[Course / Nanodegree]", issuer: "[Platform]", year: "[Year]" },
];

export const socials: SocialLink[] = [
  {
    label: "Email",
    value: "[you@example.com]",
    href: "mailto:you@example.com",
  },
  { label: "GitHub", value: "[github.com/yourhandle]", href: "#" },
  { label: "LinkedIn", value: "[linkedin.com/in/yourhandle]", href: "#" },
  { label: "X / Twitter", value: "[@yourhandle]", href: "#" },
];
