"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { deletePropertyPhoto, reorderPropertyPhotos } from "@/app/admin/(protected)/actions";

type Photo = { id: string; url: string };

export function PropertyPhotoManager({
  propertySlug,
  initialPhotos,
}: {
  propertySlug: string;
  initialPhotos: Photo[];
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    setPhotos((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
    setSavedNote(null);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePropertyPhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    });
  }

  function handleSaveOrder() {
    startTransition(async () => {
      await reorderPropertyPhotos(
        propertySlug,
        photos.map((p) => p.id),
      );
      setDirty(false);
      setSavedNote("Order saved.");
    });
  }

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("propertySlug", propertySlug);
      const res = await fetch("/api/admin/property-photos", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setPhotos((prev) => [...prev, { id: data.id, url: data.url }]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded bg-surface p-7 shadow-card">
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="flex flex-col gap-2 rounded border border-border p-2">
              <div className="relative h-28 w-full overflow-hidden rounded bg-[#eeeeee]">
                <Image src={photo.url} alt="" fill className="object-cover" sizes="200px" />
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded border border-input-border px-2 py-1 text-xs disabled:opacity-40"
                    aria-label="Move earlier"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === photos.length - 1}
                    className="rounded border border-input-border px-2 py-1 text-xs disabled:opacity-40"
                    aria-label="Move later"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  disabled={pending}
                  className="rounded border border-input-border px-2 py-1 text-xs text-[#c62828] disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="w-fit cursor-pointer rounded border border-input-border px-3.5 py-2 text-xs font-medium text-primary-dark">
          {uploading ? "Uploading…" : "+ Upload photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
        </label>
        {uploadError && <span className="text-xs text-[#c62828]">{uploadError}</span>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSaveOrder}
          disabled={pending || !dirty}
          className="rounded bg-primary px-6 py-2.5 text-[13px] font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save order"}
        </button>
        <span role="status" className="text-xs text-text-secondary">
          {savedNote}
        </span>
      </div>
    </div>
  );
}
