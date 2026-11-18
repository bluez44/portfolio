import * as THREE from "three";

/**
 * Draws the vector emblem of Trường Đại học Bách khoa - ĐHQG TP.HCM (HCMUT).
 * 3 isometric cubes arranged in a hexagon with white outline and text "BK" / "TP.HCM".
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

  // Hexagon background container (white border backing)
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#0c2856";
  ctx.fill();
  ctx.lineWidth = Math.max(2, size * 0.045);
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  // 3 Isometric cubes (Top, Bottom-Left, Bottom-Right)
  const cubeR = r * 0.46;
  const drawCube = (ox: number, oy: number) => {
    const h = cubeR;
    const w = cubeR * sqrt3_2;

    // Top face
    ctx.beginPath();
    ctx.moveTo(ox, oy - h);
    ctx.lineTo(ox + w, oy - h * 0.5);
    ctx.lineTo(ox, oy);
    ctx.lineTo(ox - w, oy - h * 0.5);
    ctx.closePath();
    ctx.fillStyle = "#38bdf8";
    ctx.fill();
    ctx.lineWidth = Math.max(1, size * 0.02);
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Left face
    ctx.beginPath();
    ctx.moveTo(ox - w, oy - h * 0.5);
    ctx.lineTo(ox, oy);
    ctx.lineTo(ox, oy + h);
    ctx.lineTo(ox - w, oy + h * 0.5);
    ctx.closePath();
    ctx.fillStyle = "#0284c7";
    ctx.fill();
    ctx.stroke();

    // Right face
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + w, oy - h * 0.5);
    ctx.lineTo(ox + w, oy + h * 0.5);
    ctx.lineTo(ox, oy + h);
    ctx.closePath();
    ctx.fillStyle = "#1e40af";
    ctx.fill();
    ctx.stroke();
  };

  // Center offsets for the 3 cubes
  const d = cubeR * 0.88;
  drawCube(cx, cy - d * 0.65);
  drawCube(cx - d * sqrt3_2, cy + d * 0.5);
  drawCube(cx + d * sqrt3_2, cy + d * 0.5);

  // Central text badge: "BK" on top, "TP.HCM" underneath
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Text shadow / backing for crisp contrast
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${Math.round(size * 0.28)}px system-ui, -apple-system, sans-serif`;
  ctx.fillText("BK", cx, cy - size * 0.05);

  ctx.font = `bold ${Math.round(size * 0.11)}px system-ui, -apple-system, sans-serif`;
  ctx.fillText("TP.HCM", cx, cy + size * 0.18);

  ctx.restore();
}

/**
 * Creates the procedural texture for the graduation stole (khăn tốt nghiệp).
 * Includes the low-poly triangular pattern and the bottom solid block with the BK logo.
 */
export function createStoleTexture(withLogo = true): THREE.Texture {
  if (typeof document === "undefined") {
    // In Node.js testing environments, return a fallback texture.
    const tex = new THREE.DataTexture(new Uint8Array([0, 100, 200, 255]), 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const width = 256;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  // Background base
  ctx.fillStyle = "#0284c7";
  ctx.fillRect(0, 0, width, height);

  // Upper 78% is low-poly / polygon triangular mesh
  const meshHeight = Math.round(height * 0.78);
  const palette = [
    "#0284c7",
    "#0ea5e9",
    "#38bdf8",
    "#60a5fa",
    "#1d4ed8",
    "#2563eb",
    "#7dd3fc",
    "#1e40af",
    "#0369a1",
  ];

  // Grid for Delaunay-style triangle mesh
  const cols = 6;
  const rows = 26;
  const dx = width / cols;
  const dy = meshHeight / rows;

  // Generate deterministic points
  const points: [number, number][][] = [];
  for (let r = 0; r <= rows; r++) {
    const rowPoints: [number, number][] = [];
    for (let c = 0; c <= cols; c++) {
      let x = c * dx;
      let y = r * dy;
      if (c > 0 && c < cols && r > 0 && r < rows) {
        // Deterministic pseudo-jitter
        const jitterX = Math.sin(r * 11 + c * 7) * (dx * 0.28);
        const jitterY = Math.cos(r * 7 + c * 13) * (dy * 0.25);
        x += jitterX;
        y += jitterY;
      }
      rowPoints.push([x, y]);
    }
    points.push(rowPoints);
  }

  // Draw triangles
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";

  let colorIdx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p00 = points[r][c];
      const p10 = points[r][c + 1];
      const p01 = points[r + 1][c];
      const p11 = points[r + 1][c + 1];

      // Split quad into 2 triangles
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

  // Lower 22% is solid bright blue panel
  ctx.fillStyle = "#0284c7";
  ctx.fillRect(0, meshHeight, width, height - meshHeight);

  // Subtle separator line
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(0, meshHeight - 2, width, 4);

  // If enabled, draw the BK TP.HCM logo in the bottom solid panel
  if (withLogo) {
    drawBKHcmutLogo(ctx, width * 0.5, meshHeight + (height - meshHeight) * 0.5, width * 0.65);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
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

  // Transparent background
  ctx.clearRect(0, 0, size, size);

  // Draw logo centered
  drawBKHcmutLogo(ctx, size / 2, size / 2, size * 0.85);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
