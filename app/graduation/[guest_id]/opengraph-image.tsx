import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { loadGraduationContent } from "@/lib/graduation/content/load-content";
import { getInvitationGuest } from "@/lib/graduation/get-invitation-guest";
import { getGraduationLang } from "@/lib/graduation/i18n/get-lang";
import type { InvitationGuest } from "@/lib/graduation/types";

const SIZE = { width: 1200, height: 630 };
/** Lives in public/ so the standalone build ships it; any font with Vietnamese glyphs works. */
const FONT_PATH = join(process.cwd(), "public/fonts/BricolageGrotesque-Bold.ttf");

const PAPER = "#fbf8f2";
const RULE = "#f2ede2";
const INK = "#1c1b1f";
const INK_2 = "#4a4a52";
const TOMATO = "#ef4e2b";

type Params = { guest_id: string };

async function findGuest(params: Params | Promise<Params>): Promise<InvitationGuest | null> {
  const { guest_id } = await params;
  if (!guest_id) return null;
  try {
    return (await getInvitationGuest(guest_id))?.guest ?? null;
  } catch {
    // A DB hiccup should still leave the link with the generic preview, not a broken image.
    return null;
  }
}

export const alt = "Thiệp mời tốt nghiệp – Võ Lê Quang Vinh";
export const size = SIZE;
export const contentType = "image/png";

/** Long names shrink so they stay on one or two lines. */
function nameFontSize(name: string): number {
  if (name.length <= 14) return 124;
  if (name.length <= 22) return 100;
  if (name.length <= 32) return 80;
  return 64;
}

let fontPromise: Promise<ArrayBuffer | null> | null = null;

function loadFont(): Promise<ArrayBuffer | null> {
  if (!fontPromise) {
    fontPromise = readFile(FONT_PATH)
      .then((buf) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer)
      .catch(() => null);
  }
  return fontPromise;
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const [guest, font, lang] = await Promise.all([findGuest(params), loadFont(), getGraduationLang()]);
  const { copy } = await loadGraduationContent(lang, guest);
  const name = guest?.name ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 40,
          background: PAPER,
          fontFamily: font ? "Bricolage" : undefined,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
            border: `3px solid ${INK}`,
            borderRadius: 24,
            backgroundColor: PAPER,
            backgroundImage: `linear-gradient(${RULE} 2px, transparent 2px)`,
            backgroundSize: "100% 48px",
            boxShadow: `8px 8px 0 ${INK}`,
            color: INK,
          }}
        >
          <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: TOMATO }}>
            {`${copy.envelope.airMail} · ${copy.envelope.invitationNo}`.toUpperCase()}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", fontSize: 40, color: INK_2 }}>{name ? copy.envelope.to : copy.meta.description}</div>
            {name && (
              <div style={{ display: "flex", fontSize: nameFontSize(name), lineHeight: 1.05, letterSpacing: -2 }}>
                {name}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingTop: 24,
              borderTop: `3px dashed ${INK}`,
              fontSize: 26,
              color: INK_2,
            }}
          >
            <span>{copy.envelope.from}</span>
            <span>{copy.rails.whenValue}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts: font ? [{ name: "Bricolage", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );
}
