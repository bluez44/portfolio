import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { getInvitationGuest } from "@/lib/graduation/get-invitation-guest";
import { GRADUATION_COPY } from "@/lib/graduation/i18n";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const copy = GRADUATION_COPY.vi;
const CARD_SIZE = { width: 1200, height: 750 };
const FONT_PATH = join(process.cwd(), "public/fonts/BricolageGrotesque-Bold.ttf");

const PAPER = "#fbf8f2";
const RULE = "#f2ede2";
const INK = "#1c1b1f";
const INK_2 = "#4a4a52";
const INK_3 = "#7a7a83";
const TOMATO = "#ef4e2b";
const BLUE = "#2c4f7c";

const MAP_URL = "https://www.google.com/maps/search/?api=1&query=10.774599,106.659381";

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
  let name = "";
  if (guest_id) {
    try {
      const found = await getInvitationGuest(guest_id);
      name = found?.guest.name ?? "";
    } catch {
      name = "";
    }
  }

  const webUrl = `${SITE_URL}/graduation/${guest_id}`;

  const [qrWeb, qrMap, font] = await Promise.all([
    QRCode.toDataURL(webUrl, {
      margin: 1,
      color: { dark: INK, light: "#ffffff" },
      width: 280,
    }),
    QRCode.toDataURL(MAP_URL, {
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
              HCMUT · 2026 · TP.HCM
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
                    fontSize: nameFontSize(name || "Quý khách"),
                    lineHeight: 1.08,
                    letterSpacing: -1.5,
                    color: INK,
                  }}
                >
                  {name ? `${copy.envelope.to} ${name}` : copy.meta.description}
                </span>
                <span style={{ fontSize: 20, color: INK_2, marginTop: 12 }}>
                  Đến tham dự Lễ tốt nghiệp Kỹ sư của Võ Lê Quang Vinh
                </span>
                <span style={{ fontSize: 18, color: INK_3 }}>
                  K22 · Khoa học Máy tính · Trường ĐH Bách Khoa — ĐHQG-HCM
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
                <span>🗓️ {copy.rails.when}: {copy.rails.whenValue} · 16:30 — 18:30</span>
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
                <img src={qrWeb} width={104} height={104} alt="QR Thiệp mời" />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 14, letterSpacing: 1, color: TOMATO }}>
                    QUÉT XEM THIỆP
                  </span>
                  <span style={{ fontSize: 12, color: INK_2 }}>
                    Trang web thiệp mời, gửi lời chúc & hồi âm
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
                <img src={qrMap} width={104} height={104} alt="QR Chỉ đường" />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 14, letterSpacing: 1, color: BLUE }}>
                    CHỈ ĐƯỜNG ĐẾN LỄ
                  </span>
                  <span style={{ fontSize: 12, color: INK_2 }}>
                    Mở Google Maps chỉ đường đến Hội trường A5
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
            <span>Rất vinh hạnh được đón tiếp bạn trong ngày vui này!</span>
            <span>vinhvolequang.io.vn</span>
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
