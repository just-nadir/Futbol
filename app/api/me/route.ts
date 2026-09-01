import { NextRequest, NextResponse } from "next/server";
import { validateAndUpsertUser } from "@/lib/telegram-auth";

/** Mini App ochilganda chaqiriladi: initData'ni tekshiradi va foydalanuvchini bazaga yozadi. */
export async function POST(req: NextRequest) {
  const { initData } = await req.json();
  if (!initData) {
    return NextResponse.json({ error: "initData required" }, { status: 400 });
  }

  try {
    const user = await validateAndUpsertUser(initData);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "invalid initData" },
      { status: 401 },
    );
  }
}
