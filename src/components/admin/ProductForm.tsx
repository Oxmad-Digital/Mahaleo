"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProductFormState, ProductSizeEntry } from "@/lib/definitions";
import { uploadProductImage } from "@/app/actions/uploads";

function parseImagesList(raw: string | undefined) {
  if (!raw) return [];
  return raw
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputStyle: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  padding: "9px 12px",
  borderRadius: 6,
  border: "1px solid rgba(55,53,47,0.15)",
  fontSize: 14,
  fontFamily: "inherit",
  color: "#37352f",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(55,53,47,0.7)",
};

export function ProductForm({
  action,
  initial,
  submitLabel,
  pendingLabel,
  successMessage = "Produit enregistré avec succès.",
  embedded = false,
}: {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  initial?: {
    name: string;
    slug: string;
    description: string;
    price: string;
    images: string;
    sizes: ProductSizeEntry[];
  };
  submitLabel: string;
  pendingLabel: string;
  successMessage?: string;
  embedded?: boolean;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (!state?.success) return;
    const timeout = setTimeout(() => {
      router.back();
      router.refresh();
    }, 1200);
    return () => clearTimeout(timeout);
  }, [state, router]);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [images, setImages] = useState<string[]>(() => parseImagesList(initial?.images));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sizes, setSizes] = useState<ProductSizeEntry[]>(
    () => initial?.sizes ?? [{ size: "", stock: "0" }]
  );

  function updateSize(index: number, patch: Partial<ProductSizeEntry>) {
    setSizes((prev) => prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function addSize() {
    setSizes((prev) => [...prev, { size: "", stock: "0" }]);
  }

  function removeSize(index: number) {
    setSizes((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      const result = await uploadProductImage(fd);
      if ("error" in result) {
        setUploadError(result.error);
      } else {
        setImages((prev) => [...prev, result.url]);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form
      action={formAction}
      style={
        embedded
          ? { padding: "24px", display: "flex", flexDirection: "column", gap: 20 }
          : {
              padding: "24px 24px 22px",
              borderRadius: 8,
              border: "1px solid rgba(55,53,47,0.09)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              maxWidth: 620,
            }
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="name" style={labelStyle}>
          Nom du produit
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initial?.name}
          placeholder="Pull crème en maille"
          style={inputStyle}
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
        {state?.errors?.name && <FieldError messages={state.errors.name} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="slug" style={labelStyle}>
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          value={slug}
          placeholder="pull-creme-en-maille"
          style={inputStyle}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
        />
        {state?.errors?.slug && <FieldError messages={state.errors.slug} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="description" style={labelStyle}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={initial?.description}
          placeholder="Description du produit…"
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        {state?.errors?.description && <FieldError messages={state.errors.description} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 200 }}>
        <label htmlFor="price" style={labelStyle}>
          Prix (EUR)
        </label>
        <input id="price" name="price" type="text" inputMode="decimal" defaultValue={initial?.price} placeholder="49.90" style={inputStyle} />
        {state?.errors?.price && <FieldError messages={state.errors.price} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={labelStyle}>Stock par taille</label>
        <input type="hidden" name="sizes" value={JSON.stringify(sizes)} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sizes.map((entry, index) => (
            <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "center" }}>
              <input
                type="text"
                value={entry.size}
                onChange={(e) => updateSize(index, { size: e.target.value })}
                placeholder="Taille (ex. M)"
                style={inputStyle}
              />
              <input
                type="text"
                inputMode="numeric"
                value={entry.stock}
                onChange={(e) => updateSize(index, { stock: e.target.value })}
                placeholder="Stock"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removeSize(index)}
                disabled={sizes.length <= 1}
                aria-label="Supprimer cette taille"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: "1px solid rgba(55,53,47,0.15)",
                  background: "transparent",
                  color: "#a82c2c",
                  fontSize: 16,
                  lineHeight: 1,
                  cursor: sizes.length <= 1 ? "default" : "pointer",
                  opacity: sizes.length <= 1 ? 0.4 : 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addSize}
          style={{
            alignSelf: "flex-start",
            padding: "7px 12px",
            borderRadius: 6,
            border: "1px solid rgba(55,53,47,0.15)",
            background: "transparent",
            fontSize: 13,
            fontWeight: 500,
            color: "#37352f",
            cursor: "pointer",
          }}
        >
          + Ajouter une taille
        </button>
        {state?.errors?.sizes && <FieldError messages={state.errors.sizes} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={labelStyle}>Images</label>
        <input type="hidden" name="images" value={images.join("\n")} />

        {images.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {images.map((url, index) => (
              <div
                key={url}
                style={{
                  position: "relative",
                  width: 84,
                  height: 84,
                  borderRadius: 6,
                  border: index === 0 ? "2px solid var(--brand-green, #1c6b3a)" : "1px solid rgba(55,53,47,0.15)",
                  overflow: "hidden",
                  background: "#f7f6f4",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                  aria-label="Supprimer l'image"
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    fontSize: 12,
                    lineHeight: 1,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={uploading}
          onChange={(e) => handleFilesSelected(e.target.files)}
          style={inputStyle}
        />
        {uploading && <span style={{ fontSize: 12, color: "rgba(55,53,47,0.45)" }}>Envoi en cours…</span>}
        {uploadError && <p style={{ fontSize: 12, color: "#a82c2c", margin: 0 }}>{uploadError}</p>}
        {state?.errors?.images && <FieldError messages={state.errors.images} />}
        <span style={{ fontSize: 12, color: "rgba(55,53,47,0.45)" }}>La première image sera utilisée comme visuel principal.</span>
      </div>

      {state?.message && <p style={{ fontSize: 13, color: "#a82c2c", margin: 0 }}>{state.message}</p>}

      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "none",
            background: "var(--brand-green, #1c6b3a)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: pending ? "default" : "pointer",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? pendingLabel : submitLabel}
        </button>
        {embedded ? (
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "10px 18px",
              borderRadius: 6,
              border: "1px solid rgba(55,53,47,0.09)",
              background: "transparent",
              fontSize: 14,
              fontWeight: 500,
              color: "#37352f",
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
        ) : (
          <Link
            href="/admin/produits"
            style={{
              padding: "10px 18px",
              borderRadius: 6,
              border: "1px solid rgba(55,53,47,0.09)",
              fontSize: 14,
              fontWeight: 500,
              color: "#37352f",
            }}
          >
            Annuler
          </Link>
        )}
      </div>

      {state?.success && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 6,
            background: "#e5f3ea",
            color: "#1c6b3a",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {successMessage}
        </div>
      )}
    </form>
  );
}

function FieldError({ messages }: { messages: string[] }) {
  return <p style={{ fontSize: 12, color: "#a82c2c", margin: 0 }}>{messages[0]}</p>;
}
