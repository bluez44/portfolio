import * as THREE from "three";

/**
 * Draws the official emblem of Trường Đại học Bách khoa - ĐHQG TP.HCM (HCMUT),
 * matching `01_logobachkhoatoi.png` and `bk-badge.tsx`:
 * - 3 isometric blue cubes arranged around a central white hexagon
 * - "BK" in bold dark blue (#002b80) and "TP.HCM" in bold cyan-blue (#007ad9) inside the white hexagon
 * - Outer white contour border
 */
export function drawBKHcmutLogo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
): void {
  ctx.save();

  const r = size * 0.48;
  const sqrt3_2 = Math.sqrt(3) / 2; // ~0.866
  const cos30 = sqrt3_2;
  const sin30 = 0.5;

  // Outer white backing hexagon / border
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // 3 Isometric cubes forming the notched hexagon
  // Each cube is drawn with its two visible outer faces matching 01_logobachkhoatoi.png
  const cubeR = r * 0.48;
  const darkNavy = "#002b80";
  const brightBlue = "#007ad9";

  // Top Cube
  const topCx = cx;
  const topCy = cy - r * 0.45;
  // Left face of top cube (dark navy)
  ctx.beginPath();
  ctx.moveTo(topCx, topCy - cubeR);
  ctx.lineTo(topCx, topCy);
  ctx.lineTo(topCx - cubeR * cos30, topCy + cubeR * sin30);
  ctx.lineTo(topCx - cubeR * cos30, topCy - cubeR * sin30);
  ctx.closePath();
  ctx.fillStyle = darkNavy;
  ctx.fill();

  // Right face of top cube (bright blue)
  ctx.beginPath();
  ctx.moveTo(topCx, topCy - cubeR);
  ctx.lineTo(topCx + cubeR * cos30, topCy - cubeR * sin30);
  ctx.lineTo(topCx + cubeR * cos30, topCy + cubeR * sin30);
  ctx.lineTo(topCx, topCy);
  ctx.closePath();
  ctx.fillStyle = brightBlue;
  ctx.fill();

  // Bottom-Left Cube
  const blCx = cx - r * 0.45 * cos30;
  const blCy = cy + r * 0.45 * sin30;
  // Top face of bottom-left cube (bright blue)
  ctx.beginPath();
  ctx.moveTo(blCx, blCy - cubeR);
  ctx.lineTo(blCx + cubeR * cos30, blCy - cubeR * sin30);
  ctx.lineTo(blCx, blCy);
  ctx.lineTo(blCx - cubeR * cos30, blCy - cubeR * sin30);
  ctx.closePath();
  ctx.fillStyle = brightBlue;
  ctx.fill();

  // Right face of bottom-left cube (dark navy)
  ctx.beginPath();
  ctx.moveTo(blCx, blCy);
  ctx.lineTo(blCx + cubeR * cos30, blCy - cubeR * sin30);
  ctx.lineTo(blCx + cubeR * cos30, blCy + cubeR * sin30);
  ctx.lineTo(blCx, blCy + cubeR);
  ctx.closePath();
  ctx.fillStyle = darkNavy;
  ctx.fill();

  // Bottom-Right Cube
  const brCx = cx + r * 0.45 * cos30;
  const brCy = cy + r * 0.45 * sin30;
  // Top face of bottom-right cube (dark navy)
  ctx.beginPath();
  ctx.moveTo(brCx, brCy - cubeR);
  ctx.lineTo(brCx + cubeR * cos30, brCy - cubeR * sin30);
  ctx.lineTo(brCx, brCy);
  ctx.lineTo(brCx - cubeR * cos30, brCy - cubeR * sin30);
  ctx.closePath();
  ctx.fillStyle = darkNavy;
  ctx.fill();

  // Left face of bottom-right cube (bright blue)
  ctx.beginPath();
  ctx.moveTo(brCx - cubeR * cos30, brCy - cubeR * sin30);
  ctx.lineTo(brCx, brCy);
  ctx.lineTo(brCx, brCy + cubeR);
  ctx.lineTo(brCx - cubeR * cos30, brCy + cubeR * sin30);
  ctx.closePath();
  ctx.fillStyle = brightBlue;
  ctx.fill();

  // Central white hexagon
  const centerR = r * 0.44;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + centerR * Math.cos(angle);
    const y = cy + centerR * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, size * 0.02);
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  // Central Typography: "BK" in dark navy and "TP.HCM" in bright blue
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = darkNavy;
  ctx.font = `900 ${Math.round(size * 0.26)}px "Inter", "Arial Black", system-ui, sans-serif`;
  ctx.fillText("BK", cx, cy - size * 0.05);

  ctx.fillStyle = brightBlue;
  ctx.font = `900 ${Math.round(size * 0.105)}px "Inter", "Arial Black", system-ui, sans-serif`;
  ctx.fillText("TP.HCM", cx, cy + size * 0.14);

  // Outer border stroke
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.lineWidth = Math.max(2, size * 0.04);
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  ctx.restore();
}

/**
 * Creates the procedural texture for the graduation stole (khăn tốt nghiệp).
 * Includes:
 * - Bold geometric low-poly triangles in blue shades (upper 75%)
 * - Prominent BK TP.HCM logo placed on the upper chest so it is visible even when sitting with laptop
 * - Solid bright blue panel at the bottom (lower 25%) with logo on the end
 * - Asynchronous loader for `/01_logobachkhoatoi.webp` for 100% pixel-perfect matching with `BkBadge`
 */
/** Stole band face in rig units (see `stole_band` in rig.ts); the canvas keeps this aspect so the logo is not squashed. */
export const STOLE_BAND = { width: 0.12, height: 0.76 } as const;

export function createStoleTexture(withLogo = true): THREE.Texture {
  if (typeof document === "undefined") {
    const tex = new THREE.DataTexture(new Uint8Array([0, 100, 200, 255]), 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const width = 256;
  const height = Math.round((width * STOLE_BAND.height) / STOLE_BAND.width);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const renderStole = (logoImg?: HTMLImageElement) => {
    // Solid background
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(0, 0, width, height);

    // Geometric low-poly triangular pattern
    const meshHeight = Math.round(height * 0.74);
    const palette = [
      "#0284c7",
      "#0ea5e9",
      "#38bdf8",
      "#60a5fa",
      "#1d4ed8",
      "#2563eb",
      "#7dd3fc",
      "#1e40af",
    ];

    // 4 columns x 14 rows for distinct, clear low-poly facets
    const cols = 4;
    const rows = 22;
    const dx = width / cols;
    const dy = meshHeight / rows;

    const points: [number, number][][] = [];
    for (let r = 0; r <= rows; r++) {
      const rowPoints: [number, number][] = [];
      for (let c = 0; c <= cols; c++) {
        let x = c * dx;
        let y = r * dy;
        if (c > 0 && c < cols && r > 0 && r < rows) {
          const jitterX = Math.sin(r * 9 + c * 5) * (dx * 0.22);
          const jitterY = Math.cos(r * 5 + c * 11) * (dy * 0.2);
          x += jitterX;
          y += jitterY;
        }
        rowPoints.push([x, y]);
      }
      points.push(rowPoints);
    }

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";

    let colorIdx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p00 = points[r][c];
        const p10 = points[r][c + 1];
        const p01 = points[r + 1][c];
        const p11 = points[r + 1][c + 1];

        const color1 = palette[(colorIdx * 3 + r * 5 + c * 2) % palette.length];
        colorIdx++;
        ctx.beginPath();
        ctx.moveTo(p00[0], p00[1]);
        ctx.lineTo(p10[0], p10[1]);
        ctx.lineTo(p01[0], p01[1]);
        ctx.closePath();
        ctx.fillStyle = color1;
        ctx.fill();
        ctx.stroke();

        const color2 = palette[(colorIdx * 5 + r * 2 + c * 7) % palette.length];
        colorIdx++;
        ctx.beginPath();
        ctx.moveTo(p10[0], p10[1]);
        ctx.lineTo(p11[0], p11[1]);
        ctx.lineTo(p01[0], p01[1]);
        ctx.closePath();
        ctx.fillStyle = color2;
        ctx.fill();
        ctx.stroke();
      }
    }

    // Lower 26% is solid bright blue panel
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(0, meshHeight, width, height - meshHeight);

    // Separator line
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(0, meshHeight - 3, width, 6);

    // Helper to draw logo either from loaded image or vector fallback
    const drawLogoAt = (cx: number, cy: number, size: number) => {
      if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.drawImage(logoImg, cx - size / 2, cy - size / 2, size, size);
      } else {
        drawBKHcmutLogo(ctx, cx, cy, size);
      }
    };

    if (withLogo) {
      // 1. Prominent chest badge (upper chest ~30% from top):
      // Always clearly visible, even when character is sitting and typing on laptop!
      const chestY = Math.round(height * 0.3);
      const chestSize = width * 0.68;

      // Soft circular backing to guarantee maximum logo clarity over triangles
      ctx.beginPath();
      ctx.arc(width * 0.5, chestY, chestSize * 0.52, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fill();

      drawLogoAt(width * 0.5, chestY, chestSize);

      // 2. Bottom panel logo (for standing/walking full-view):
      const bottomY = meshHeight + (height - meshHeight) * 0.5;
      const bottomSize = width * 0.62;
      drawLogoAt(width * 0.5, bottomY, bottomSize);
    }
  };

  renderStole();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  // Asynchronously load the official image used in BkBadge for pixel-perfect fidelity
  if (typeof Image !== "undefined" && withLogo) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      renderStole(img);
      texture.needsUpdate = true;
    };
    img.src = "/01_logobachkhoatoi.webp";
  }

  return texture;
}

/**
 * Creates the BK TP.HCM badge texture for the graduation cap skull.
 */
export function createCapBadgeTexture(): THREE.Texture {
  if (typeof document === "undefined") {
    const tex = new THREE.DataTexture(new Uint8Array([0, 100, 200, 255]), 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const renderBadge = (logoImg?: HTMLImageElement) => {
    ctx.clearRect(0, 0, size, size);
    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.drawImage(logoImg, size * 0.05, size * 0.05, size * 0.9, size * 0.9);
    } else {
      drawBKHcmutLogo(ctx, size / 2, size / 2, size * 0.9);
    }
  };

  renderBadge();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  if (typeof Image !== "undefined") {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      renderBadge(img);
      texture.needsUpdate = true;
    };
    img.src = "/01_logobachkhoatoi.webp";
  }

  return texture;
}
