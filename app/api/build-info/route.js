import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      branch: process.env.VERCEL_GIT_COMMIT_REF || null,
      env: process.env.VERCEL_ENV || "local",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
