"use client";

import { useEffect, useState } from "react";
import { useTelegram } from "@/lib/use-telegram";
import { AdminUserRow } from "@/components/AdminUserRow";
import type { AdminUserRow as AdminUserRowType } from "@/lib/types";

export default function AdminPage() {
  const telegram = useTelegram();
  const [users, setUsers] = useState<AdminUserRowType[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (telegram.status !== "ready") return;
    fetch("/api/admin/users", { headers: { "X-Telegram-Init-Data": telegram.initData } })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Xatolik");
        setUsers(data.users);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Xatolik"));
  }, [telegram]);

  if (telegram.status === "loading") {
    return <div className="p-6 text-center text-neutral-400">Yuklanmoqda...</div>;
  }
  if (telegram.status === "error") {
    return <div className="p-6 text-center text-neutral-400">{telegram.message}</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-neutral-400">🔒 {error}</div>;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-bold text-white">⚙️ Admin panel</h1>
      <p className="text-sm text-neutral-400">
        Har bir a&apos;zoga ko&apos;rinadigan ism va rasm belgilang.
      </p>

      {users === null ? (
        <p className="text-sm text-neutral-500">Yuklanmoqda...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Hali hech kim ilovani ochmagan — a&apos;zolar botni /start qilganda shu yerda paydo bo&apos;ladi.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <AdminUserRow
              key={u.id}
              user={u}
              initData={telegram.initData}
              onUpdated={(patch) =>
                setUsers((prev) =>
                  prev ? prev.map((x) => (x.id === u.id ? { ...x, ...patch } : x)) : prev,
                )
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
