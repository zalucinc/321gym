import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { buildingCodes } from "@/lib/auth";

// SVG QR code for a building's join link. Only real codes get a QR, so the
// endpoint can't be used to mint posters for codes that don't exist.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") ?? "").trim().toUpperCase();
  if (!buildingCodes()[code]) return new NextResponse("unknown building code", { status: 404 });
  const target = `${url.origin}/join?code=${encodeURIComponent(code)}`;
  const svg = await QRCode.toString(target, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#141110", light: "#ffffff" } });
  return new NextResponse(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" } });
}
