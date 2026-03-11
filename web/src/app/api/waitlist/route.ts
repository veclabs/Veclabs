import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  console.log(`[VecLabs Waitlist] New signup: ${email}`);

  //TODO Phase 4: write to Supabase waitlist table

  return NextResponse.json({ ok: true });
}
