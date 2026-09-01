import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendMessage } from "@/lib/telegram-bot";
import type { Match } from "@/lib/types";

const REMINDER_WINDOW_HOURS = 3;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const chatId = process.env.TELEGRAM_GROUP_CHAT_ID;
  if (!chatId) return NextResponse.json({ error: "TELEGRAM_GROUP_CHAT_ID not set" }, { status: 500 });

  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

  const { data: matches, error } = await supabaseAdmin
    .from("matches")
    .select("*")
    .gte("starts_at", now.toISOString())
    .lte("starts_at", windowEnd.toISOString());
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: string[] = [];

  for (const match of matches as Match[]) {
    const when = new Date(match.starts_at).toLocaleString("uz-UZ", {
      dateStyle: "full",
      timeStyle: "short",
    });

    if (!match.reminder_sent_at) {
      await sendMessage(
        chatId,
        `⏰ Eslatma: bugungi o'yin\n📅 ${when}\n📍 ${match.location}`,
        { withAppButton: true, matchPath: `?match=${match.id}` },
      );
      await supabaseAdmin
        .from("matches")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", match.id);
      results.push(`reminder sent: ${match.id}`);
    }

    if (!match.low_headcount_alert_sent_at) {
      const { count } = await supabaseAdmin
        .from("rsvps")
        .select("*", { count: "exact", head: true })
        .eq("match_id", match.id)
        .eq("status", "going");

      if ((count ?? 0) < match.min_players) {
        await sendMessage(
          chatId,
          `⚠️ Diqqat! ${when} o'yiniga hozircha faqat ${count ?? 0} kishi "boraman" degan (kamida ${match.min_players} kerak).`,
          { withAppButton: true, matchPath: `?match=${match.id}` },
        );
        await supabaseAdmin
          .from("matches")
          .update({ low_headcount_alert_sent_at: new Date().toISOString() })
          .eq("id", match.id);
        results.push(`low headcount alert sent: ${match.id}`);
      }
    }
  }

  return NextResponse.json({ ok: true, checked: matches.length, actions: results });
}
