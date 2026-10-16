"use client";

import { useState } from "react";

type Doc = { url: string; fileName: string } | null;

export function DocumentUploader({
  documentKey,
  label,
  initial,
}: {
  documentKey: string;
  label: string;
  initial: Doc;
}) {
  const [doc, setDoc] = useState<Doc>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", documentKey);
      const res = await fetch("/api/admin/documents", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setDoc({ url: data.url, fileName: data.fileName });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded bg-surface p-7 shadow-card">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{label}</span>
        {doc ? (
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="w-fit text-sm text-primary hover:text-primary-dark"
          >
            {doc.fileName}
          </a>
        ) : (
          <span className="text-sm text-text-secondary">No document uploaded yet.</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="w-fit cursor-pointer rounded border border-input-border px-3.5 py-2 text-xs font-medium text-primary-dark">
          {uploading ? "Uploading…" : doc ? "+ Replace PDF" : "+ Upload PDF"}
          <input
            type="file"
            accept="application/pdf"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
        </label>
        {error && <span className="text-xs text-[#c62828]">{error}</span>}
      </div>
    </div>
  );
}
