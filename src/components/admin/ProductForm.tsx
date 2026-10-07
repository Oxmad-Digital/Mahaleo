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

const moveButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "2px 0",
  border: "none",
  background: "transparent",
  color: "#fff",
  fontSize: 13,
  lineHeight: 1.2,
  textAlign: "center",
  cursor: "pointer",
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
    productType: string;
    color: string;
    colorName: string;
    material: string;
    fit: string;
    care: string;
    price: string;
    images: string;
    sizes: ProductSizeEntry[];
    onSale: boolean;
    salePrice: string;
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
  const [name, setName] = useState(initial?.name ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [hasColor, setHasColor] = useState(Boolean(initial?.color));
  const [color, setColor] = useState(initial?.color || "#1c6b3a");
  const [productType, setProductType] = useState(initial?.productType ?? "");
  const [colorName, setColorName] = useState(initial?.colorName ?? "");
  const [material, setMaterial] = useState(initial?.material ?? "");
  const [fit, setFit] = useState(initial?.fit ?? "");
  const [care, setCare] = useState(initial?.care ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [salePrice, setSalePrice] = useState(initial?.salePrice ?? "");
  const [images, setImages] = useState<string[]>(() => parseImagesList(initial?.images));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sizes, setSizes] = useState<ProductSizeEntry[]>(
    () => initial?.sizes ?? [{ size: "", stock: "0" }]
  );
  const [onSale, setOnSale] = useState(initial?.onSale ?? false);

  function updateSize(index: number, patch: Partial<ProductSizeEntry>) {
    setSizes((prev) =>
      prev.map((entry, i) => {
        if (i !== index) return entry;
        const next = { ...entry, ...patch };
        // Une taille renommée n'est plus celle dont le stock initial a été lu.
        if (patch.size !== undefined && patch.size !== entry.size) delete next.initialStock;
        return next;
      })
    );
  }

  function addSize() {
    setSizes((prev) => [...prev, { size: "", stock: "0" }]);
  }

  function removeSize(index: number) {
    setSizes((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  /** Déplace une image dans la liste ; l'ordre du tableau est l'ordre d'affichage. */
  function moveImage(from: number, to: number) {
    setImages((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
      className={`retro-admin-product-form${embedded ? " is-embedded" : ""}`}
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
          value={name}
          placeholder="Pull crème en maille"
          style={inputStyle}
          onChange={(e) => {
            setName(e.target.value);
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

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 280 }}>
        <label htmlFor="productType" style={labelStyle}>
          Type de produit
        </label>
        <input
          id="productType"
          name="productType"
          type="text"
          list="product-type-options"
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
          placeholder="T-shirt"
          style={inputStyle}
        />
        <datalist id="product-type-options">
          <option value="T-shirt" />
          <option value="Sweat" />
          <option value="Pull" />
          <option value="Casquette" />
          <option value="Tote bag" />
        </datalist>
        {state?.errors?.productType && <FieldError messages={state.errors.productType} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="description" style={labelStyle}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description du produit…"
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        {state?.errors?.description && <FieldError messages={state.errors.description} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="material" style={labelStyle}>
          Matière
        </label>
        <input
          id="material"
          name="material"
          type="text"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          placeholder="100 % coton biologique, 240 g/m²"
          style={inputStyle}
        />
        {state?.errors?.material && <FieldError messages={state.errors.material} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="fit" style={labelStyle}>
          Coupe et taille
        </label>
        <input
          id="fit"
          name="fit"
          type="text"
          value={fit}
          onChange={(e) => setFit(e.target.value)}
          placeholder="Coupe droite, taille normalement"
          style={inputStyle}
        />
        {state?.errors?.fit && <FieldError messages={state.errors.fit} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="care" style={labelStyle}>
          Entretien
        </label>
        <textarea
          id="care"
          name="care"
          value={care}
          onChange={(e) => setCare(e.target.value)}
          placeholder="Lavage à 30 °C sur l’envers, pas de sèche-linge"
          rows={2}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        {state?.errors?.care && <FieldError messages={state.errors.care} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={hasColor}
            onChange={(e) => setHasColor(e.target.checked)}
          />
          <span style={labelStyle}>Ce produit a une couleur</span>
        </label>

        {hasColor && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              id="color"
              name="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="color-swatch-input"
              style={{
                width: 44,
                height: 44,
                padding: 0,
                borderRadius: "50%",
                border: "1px solid rgba(55,53,47,0.15)",
                overflow: "hidden",
                cursor: "pointer",
                background: "transparent",
              }}
            />
            <style>{`
              .color-swatch-input::-webkit-color-swatch-wrapper {
                padding: 0;
              }
              .color-swatch-input::-webkit-color-swatch {
                border: none;
                border-radius: 50%;
              }
              .color-swatch-input::-moz-color-swatch {
                border: none;
                border-radius: 50%;
              }
            `}</style>
            <span style={{ fontSize: 13, color: "rgba(55,53,47,0.6)" }}>{color}</span>
            <input
              id="colorName"
              name="colorName"
              type="text"
              aria-label="Nom de la couleur"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="Nom affiché, ex. Vert forêt"
              style={{ ...inputStyle, flex: 1, minWidth: 0 }}
            />
          </div>
        )}
        {state?.errors?.color && <FieldError messages={state.errors.color} />}
        {state?.errors?.colorName && <FieldError messages={state.errors.colorName} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 200 }}>
        <label htmlFor="price" style={labelStyle}>
          Prix (EUR)
        </label>
        <input
          id="price"
          name="price"
          type="text"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="49.90"
          style={inputStyle}
        />
        {state?.errors?.price && <FieldError messages={state.errors.price} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            name="onSale"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
          />
          <span style={labelStyle}>Produit en promotion</span>
        </label>

        {onSale && (
          <div style={{ maxWidth: 200 }}>
            <input
              id="salePrice"
              name="salePrice"
              type="text"
              inputMode="decimal"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="Prix promo (EUR), ex. 39.90"
              style={inputStyle}
            />
            {state?.errors?.salePrice && <FieldError messages={state.errors.salePrice} />}
          </div>
        )}
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
            {images.map((url, index) => {
              const first = index === 0;
              const last = index === images.length - 1;
              return (
                <div
                  className={`retro-admin-product-image${first ? " is-primary" : ""}`}
                  key={`${url}-${index}`}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragEnd={() => setDragIndex(null)}
                  onDragOver={(e) => {
                    // Le glisser-déposer réordonne à la volée : la vignette
                    // tirée prend la place de celle qu'elle survole, et le
                    // curseur suit son nouvel index.
                    e.preventDefault();
                    if (dragIndex === null || dragIndex === index) return;
                    moveImage(dragIndex, index);
                    setDragIndex(index);
                  }}
                  onDrop={(e) => e.preventDefault()}
                  style={{
                    position: "relative",
                    width: 96,
                    height: 96,
                    borderRadius: 6,
                    border: first
                      ? "2px solid var(--brand-green, #1c6b3a)"
                      : "1px solid rgba(55,53,47,0.15)",
                    overflow: "hidden",
                    background: "#f7f6f4",
                    cursor: "grab",
                    opacity: dragIndex === index ? 0.4 : 1,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    draggable={false}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
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

                  {first && (
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        left: 2,
                        padding: "1px 6px",
                        borderRadius: 999,
                        background: "var(--brand-green, #1c6b3a)",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      Principale
                    </span>
                  )}

                  {/* Les flèches doublent le glisser-déposer : au clavier comme
                      au doigt, elles restent le seul moyen de réordonner. */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      background: "rgba(0,0,0,0.55)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      disabled={first}
                      aria-label="Déplacer l'image vers la gauche"
                      style={{ ...moveButtonStyle, opacity: first ? 0.35 : 1 }}
                    >
                      ‹
                    </button>
                    <span style={{ ...moveButtonStyle, cursor: "default", flex: "none", width: 22 }}>
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      disabled={last}
                      aria-label="Déplacer l'image vers la droite"
                      style={{ ...moveButtonStyle, opacity: last ? 0.35 : 1 }}
                    >
                      ›
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <input
          ref={fileInputRef}
          id="product-images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={uploading}
          onChange={(e) => handleFilesSelected(e.target.files)}
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", clipPath: "inset(50%)" }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={{
            alignSelf: "flex-start",
            padding: "9px 14px",
            borderRadius: 6,
            border: "1px solid rgba(55,53,47,0.15)",
            background: "transparent",
            color: "#37352f",
            fontSize: 13,
            fontWeight: 600,
            cursor: uploading ? "wait" : "pointer",
            opacity: uploading ? 0.65 : 1,
          }}
        >
          {uploading ? "Envoi en cours…" : "+ Ajouter une ou plusieurs images"}
        </button>
        {uploadError && <p style={{ fontSize: 12, color: "#a82c2c", margin: 0 }}>{uploadError}</p>}
        {state?.errors?.images && <FieldError messages={state.errors.images} />}
        <span style={{ fontSize: 12, color: "rgba(55,53,47,0.45)" }}>
          Sélection multiple acceptée · JPEG, PNG, WEBP ou GIF · 5 Mo maximum par image.<br />
          Glissez-déposez les vignettes (ou utilisez les flèches ‹ ›) pour changer l’ordre. La première image est le visuel principal.
        </span>
      </div>

      {state?.message && <p style={{ fontSize: 13, color: "#a82c2c", margin: 0 }}>{state.message}</p>}

      <div className="retro-admin-form-actions" style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
        <button
          className="retro-admin-form-primary"
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
            className="retro-admin-form-secondary"
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
            className="retro-admin-form-secondary"
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
          className="retro-admin-form-success"
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
