"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTelegram } from "@/lib/use-telegram";
import { useTelegramBackButton } from "@/lib/use-telegram-back-button";
import { apiFetch } from "@/lib/api-client";

export default function NewMatch() {
  const telegram = useTelegram();
  const router = useRouter();
  useTelegramBackButton("/");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxSpots, setMaxSpots] = useState(14);
  const [minPlayers, setMinPlayers] = useState(8);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (telegram.status !== "ready") {
    return <div className="p-6 text-center text-neutral-400">Yuklanmoqda...</div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (telegram.status !== "ready") return;
    setSubmitting(true);
    setError(null);
    try {
      const startsAt = new Date(`${date}T${time}`).toISOString();
      const data = await apiFetch("/api/matches", telegram.initData, {
        method: "POST",
        body: JSON.stringify({
          starts_at: startsAt,
          location,
          max_spots: Number(maxSpots),
          min_players: Number(minPlayers),
        }),
      });
      router.push(`/match/${data.match.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4">
      <h1 className="mb-6 text-xl font-bold text-white">Yangi o&apos;yin</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Sana">
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Vaqt">
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Joy">
          <input
            type="text"
            required
            placeholder="Masalan: Chilonzor sport majmuasi"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Maksimal o'rinlar">
          <input
            type="number"
            required
            min={2}
            value={maxSpots}
            onChange={(e) => setMaxSpots(Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Kamida nechta kishi kerak (ogohlantirish uchun)">
          <input
            type="number"
            required
            min={1}
            value={minPlayers}
            onChange={(e) => setMinPlayers(Number(e.target.value))}
            className={inputClass}
          />
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          {submitting ? "Yaratilmoqda..." : "O'yinni e'lon qilish"}
        </button>
      </form>
    </main>
  );
}

const inputClass =
  "rounded-xl bg-neutral-900 px-3 py-2.5 text-white ring-1 ring-neutral-800 focus:outline-none focus:ring-emerald-600";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-400">{label}</span>
      {children}
    </label>
  );
}
