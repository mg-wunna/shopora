import { useCallback, useEffect, useId, useState } from "react";
import type { Category, Product, ProductCreate, ProductListResult } from "@template/api";
import { api, formatPrice } from "../lib/api";
import { useToast } from "../components/Toast";

export function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    Promise.all([
      api<ProductListResult>("/products", { auth: false, query: { limit: 60 } }),
      api<Category[]>("/categories", { auth: false }),
    ])
      .then(([p, c]) => {
        setProducts(p.items);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = products.filter((p) =>
    search ? p.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  async function onDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await api(`/products/${id}`, { method: "DELETE" });
      toast.show("Product deleted", "success");
      refresh();
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Failed", "error");
    }
  }

  return (
    <div className="admin-page pb-24 pt-20 lg:pt-8">
      <div className="admin-hero">
        <div>
          <div className="admin-kicker">Catalog</div>
          <h1 className="admin-title">Products</h1>
          <p className="admin-subtitle">
            Manage premium product inventory, merchandising, stock, and featured placements.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          + New product
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="input max-w-sm"
        />
        <span className="text-xs text-slate-500">
          {filtered.length} of {products.length} products
        </span>
      </div>

      <div className="table-shell mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Featured</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                  No products
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="h-10 w-10 rounded-md object-cover" />
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-slate-500">★ {p.rating.toFixed(1)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{p.categoryName ?? "—"}</td>
                  <td className="px-5 py-3 font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        p.stock === 0
                          ? "badge-error"
                          : p.stock < 10
                            ? "badge-warning"
                            : "badge-neutral"
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {p.featured ? <span className="badge-info">Featured</span> : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(p);
                        setShowForm(true);
                      }}
                      className="btn-secondary text-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      className="btn-danger ml-2 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState<number>(product?.price ?? 0);
  const [stock, setStock] = useState<number>(product?.stock ?? 0);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [images, setImages] = useState((product?.images ?? []).join("\n"));
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const imageList = images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (imageList.length === 0) {
      toast.show("Add at least one image URL", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload: ProductCreate = {
        name,
        description,
        price,
        stock,
        categoryId,
        images: imageList,
        featured,
      };
      if (product) {
        await api(`/products/${product.id}`, {
          method: "PUT",
          body: { id: product.id, ...payload },
        });
        toast.show("Product updated", "success");
      } else {
        await api("/products", { method: "POST", body: payload });
        toast.show("Product created", "success");
      }
      onSaved();
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product ? "Edit product" : "New product"}
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      tabIndex={-1}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl rounded-lg border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{product ? "Edit product" : "New product"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-[var(--color-primary)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Category">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price (USD)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="input"
              required
            />
          </Field>
          <Field label="Stock">
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="input"
              required
            />
          </Field>
        </div>
        <Field label="Description" className="mt-4">
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input resize-none"
            required
          />
        </Field>
        <Field label="Image URLs or local paths (one per line)" className="mt-4">
          <textarea
            rows={3}
            value={images}
            onChange={(e) => setImages(e.target.value)}
            placeholder="/images/products/auralis-maison-headphones.jpg"
            className="input resize-none font-mono text-xs"
            required
          />
        </Field>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 accent-indigo-500"
          />
          Featured product
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className,
  children,
}: {
  label: string;
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
  children?: React.ReactNode;
}) {
  const id = useId();

  return (
    <label htmlFor={id} className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {children ? (
        children
      ) : (
        <input
          id={id}
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          required
          className="input"
        />
      )}
    </label>
  );
}
