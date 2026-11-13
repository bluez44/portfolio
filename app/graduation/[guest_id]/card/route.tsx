import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { loadGraduationContent } from "@/lib/graduation/content/load-content";
import { getInvitationGuest } from "@/lib/graduation/get-invitation-guest";
import { getGraduationLang } from "@/lib/graduation/i18n/get-lang";
import type { InvitationGuest } from "@/lib/graduation/types";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const CARD_SIZE = { width: 1200, height: 750 };
const FONT_PATH = join(process.cwd(), "public/fonts/BricolageGrotesque-Bold.ttf");

const PAPER = "#fbf8f2";
const RULE = "#f2ede2";
const INK = "#1c1b1f";
const INK_2 = "#4a4a52";
const INK_3 = "#7a7a83";
const TOMATO = "#ef4e2b";
const BLUE = "#2c4f7c";

let fontPromise: Promise<ArrayBuffer | null> | null = null;

function loadFont(): Promise<ArrayBuffer | null> {
  if (!fontPromise) {
    fontPromise = readFile(FONT_PATH)
      .then((buf) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer)
      .catch(() => null);
  }
  return fontPromise;
}

function nameFontSize(name: string): number {
  if (name.length <= 14) return 60;
  if (name.length <= 22) return 50;
  if (name.length <= 32) return 42;
  return 36;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ guest_id: string }> },
) {
  const { guest_id } = await params;
  let guest: InvitationGuest | null = null;
  if (guest_id) {
    try {
      guest = (await getInvitationGuest(guest_id))?.guest ?? null;
    } catch {
      guest = null;
    }
  }
  const name = guest?.name ?? "";
  const { copy, event, owner } = await loadGraduationContent(await getGraduationLang(), guest);

  const webUrl = `${SITE_URL}/graduation/${guest_id}`;

  const [qrWeb, qrMap, font] = await Promise.all([
    QRCode.toDataURL(webUrl, {
      margin: 1,
      color: { dark: INK, light: "#ffffff" },
      width: 280,
    }),
    QRCode.toDataURL(event.mapLinkUrl, {
      margin: 1,
      color: { dark: INK, light: "#ffffff" },
      width: 280,
    }),
    loadFont(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 36,
          backgroundColor: PAPER,
          fontFamily: font ? "Bricolage" : undefined,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: `3px solid ${INK}`,
            borderRadius: 24,
            padding: "36px 44px",
            backgroundColor: PAPER,
            backgroundImage: `linear-gradient(${RULE} 1.5px, transparent 1.5px)`,
            backgroundSize: "100% 36px",
            boxShadow: `10px 10px 0 ${INK}`,
            color: INK,
          }}
        >
          {/* Top header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `2.5px dashed ${INK}`,
              paddingBottom: 16,
            }}
          >
            <span style={{ fontSize: 22, letterSpacing: 4, color: TOMATO }}>
              {`${copy.envelope.airMail} · ${copy.envelope.invitationNo}`.toUpperCase()}
            </span>
            <span style={{ fontSize: 16, letterSpacing: 2, color: INK_2 }}>
              {`${copy.marks.school} · ${event.year} · ${copy.marks.city}`}
            </span>
          </div>

          {/* Main body: 2 columns */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "stretch",
              gap: 36,
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            {/* Left side: Greeting & event logistics */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 24, color: INK_2 }}>
                  {copy.envelope.cordially}
                </span>
                <span
                  style={{
                    fontSize: nameFontSize(name || copy.png.guestFallback),
                    lineHeight: 1.08,
                    letterSpacing: -1.5,
                    color: INK,
                  }}
                >
                  {name ? `${copy.envelope.to} ${name}` : copy.meta.description}
                </span>
                <span style={{ fontSize: 20, color: INK_2, marginTop: 12 }}>
                  {copy.png.attend}
                </span>
                <span style={{ fontSize: 18, color: INK_3 }}>
                  {copy.png.faculty}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  paddingTop: 16,
                  borderTop: `2px dashed ${INK}`,
                  fontSize: 19,
                  color: INK,
                }}
              >
                <span>🗓️ {copy.rails.when}: {copy.rails.whenValue} · {event.timeRange}</span>
                <span>📍 {copy.rails.where}: {copy.rails.whereValue}</span>
                <span style={{ fontSize: 16, color: INK_2 }}>
                  {"    "}{copy.rails.whereSub}
                </span>
              </div>
            </div>

            {/* Right side: 2 QR codes */}
            <div
              style={{
                width: 320,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderLeft: `2.5px dashed ${INK}`,
                paddingLeft: 32,
                gap: 20,
              }}
            >
              {/* QR 1: Online Invitation */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  backgroundColor: "#ffffff",
                  border: `2px solid ${INK}`,
                  borderRadius: 16,
                  padding: 12,
                  boxShadow: `4px 4px 0 ${INK}`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrWeb} width={104} height={104} alt={copy.png.qrWebAlt} />
                <div style={{ display: "flex", flex: 1, minWidth: 0, flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 14, letterSpacing: 1, color: TOMATO }}>
                    {copy.png.qrWebTitle}
                  </span>
                  <span style={{ fontSize: 12, color: INK_2 }}>
                    {copy.png.qrWebBody}
                  </span>
                </div>
              </div>

              {/* QR 2: Directions / Maps */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  backgroundColor: "#ffffff",
                  border: `2px solid ${INK}`,
                  borderRadius: 16,
                  padding: 12,
                  boxShadow: `4px 4px 0 ${INK}`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrMap} width={104} height={104} alt={copy.png.qrMapAlt} />
                <div style={{ display: "flex", flex: 1, minWidth: 0, flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 14, letterSpacing: 1, color: BLUE }}>
                    {copy.png.qrMapTitle}
                  </span>
                  <span style={{ fontSize: 12, color: INK_2 }}>
                    {copy.png.qrMapBody}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `2px solid ${INK}`,
              paddingTop: 12,
              fontSize: 15,
              color: INK_3,
            }}
          >
            <span>{copy.png.footer}</span>
            <span>{owner.website}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...CARD_SIZE,
      fonts: font ? [{ name: "Bricolage", data: font, weight: 700, style: "normal" }] : undefined,
      headers: {
        "Content-Disposition": `attachment; filename="thiep-moi-${guest_id}.png"`,
        "Content-Type": "image/png",
      },
    },
  );
}
