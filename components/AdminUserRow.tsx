"use client";

import { useRef, useState } from "react";
import { MemberAvatar } from "./MemberAvatar";
import type { AdminUserRow as AdminUserRowType } from "@/lib/types";

export function AdminUserRow({
  user,
  initData,
  onUpdated,
}: {
  user: AdminUserRowType;
  initData: string;
  onUpdated: (updated: Partial<AdminUserRowType>) => void;
}) {
  const [name, setName] = useState(user.custom_name ?? "");
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const effective = {
    ...user,
    first_name: user.custom_name || user.first_name,
    photo_url: user.custom_photo_url || user.photo_url,
  };

  async function saveName() {
    setSavingName(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/name`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": initData },
        body: JSON.stringify({ custom_name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdated({ custom_name: name.trim() || null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setSavingName(false);
    }
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/admin/users/${user.id}/photo`, {
        method: "POST",
        headers: { "X-Telegram-Init-Data": initData },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdated({ custom_photo_url: data.custom_photo_url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setUploading(false);
    }
  }

  async function clearPhoto() {
    setUploading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/photo`, {
        method: "DELETE",
        headers: { "X-Telegram-Init-Data": initData },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdated({ custom_photo_url: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-neutral-900 p-3 ring-1 ring-neutral-800">
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={uploading}
        className="relative shrink-0 disabled:opacity-50"
        title="Rasm yuklash"
      >
        <MemberAvatar user={effective} size={48} />
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px]">
          📷
        </span>
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadPhoto(file);
          e.target.value = "";
        }}
      />

      <div className="flex flex-1 flex-col gap-1">
        <p className="text-xs text-neutral-500">
          Telegram: {user.first_name} {user.username ? `(@${user.username})` : ""}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ko'rinadigan ism"
            className="min-w-0 flex-1 rounded-lg bg-neutral-800 px-2.5 py-1.5 text-sm text-white ring-1 ring-neutral-700 focus:outline-none focus:ring-emerald-600"
          />
          <button
            onClick={saveName}
            disabled={savingName}
            className="shrink-0 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {savingName ? "..." : "Saqlash"}
          </button>
        </div>
        {user.custom_photo_url && (
          <button
            onClick={clearPhoto}
            disabled={uploading}
            className="self-start text-xs text-neutral-500 underline decoration-dotted hover:text-neutral-300"
          >
            Asl Telegram rasmiga qaytarish
          </button>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
