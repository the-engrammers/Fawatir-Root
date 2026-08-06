import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "Fatourati API Service",
    timestamp: new Date().toISOString()
  });
}
