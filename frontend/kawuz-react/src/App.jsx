// src/App.jsx
import React, { useEffect, useState } from "react";

const BASE = "http://localhost:8080/api";

function ProductsList({ onSelect }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [search, setSearch] = useState("");

  const fetchProducts = (keyword = "") => {
    setLoading(true);
    setErr(null);

    let url = `${BASE}/products`;
    if (keyword) {
      url = `${BASE}/product/search?keyword=${encodeURIComponent(keyword)}`;
    }

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div>Loading products…</div>;
  if (err) return <div style={{ color: "red" }}>Error: {err}</div>;
  if (!products.length) return <div>No products returned</div>;

  return (
    <div>
      <h2>Products</h2>

      {/* Wyszukiwarka */}
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Szukaj produktów..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={() => fetchProducts(search)}>Szukaj</button>
      </div>

      <ul>
        {products.map(p => (
          <li key={p.id}>
            <button onClick={() => onSelect(p.id)} style={{ marginRight: 8 }}>
              View
            </button>
            {p.name ?? `Product ${p.id}`} — {p.price ?? "?"} zł
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductDetails({ id, onBack, refreshList }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${BASE}/product/${id}`)
      .then(res => {
        if (res.status === 404) throw new Error("Not found");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(p => setProduct(p))
      .catch(e => setMessage(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const deleteProduct = () => {
    if (!window.confirm("Delete this product?")) return;
    fetch(`${BASE}/product/${id}`, { method: "DELETE" })
      .then(res => res.text().then(text => ({ ok: res.ok, status: res.status, text })))
      .then(r => {
        if (r.ok) {
          setMessage("Deleted");
          refreshList?.();
        } else {
          setMessage(`Failed: ${r.text || r.status}`);
        }
      })
      .catch(e => setMessage(e.message));
  };

  if (!id) return null;
  if (loading) return <div>Loading product…</div>;
  if (message && !product) return <div style={{ color: "red" }}>Error: {message}</div>;

  return (
    <div>
      <button onClick={onBack}>Back to list</button>
      <h3>Product details</h3>
      {product && (
        <div>
          <div><strong>ID:</strong> {product.id}</div>
          <div><strong>Name:</strong> {product.name}</div>
          <div><strong>Price:</strong> {product.price}</div>
          <div><strong>Description:</strong> {product.description}</div>
        </div>
      )}
      <hr />
      <UpdateProductForm
        product={product}
        onUpdate={(msg) => { setMessage(msg); refreshList?.(); }}
      />
      <hr />
      <button onClick={deleteProduct}>Delete product</button>
      <div style={{ marginTop: 10 }}>{message}</div>
    </div>
  );
}

function UpdateProductForm({ product, onUpdate }) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [desc, setDesc] = useState(product?.description ?? "");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setName(product?.name ?? "");
    setPrice(product?.price ?? "");
    setDesc(product?.description ?? "");
    setMsg("");
  }, [product]);

  const submitAsJson = async (e) => {
    e.preventDefault();
    if (!product) return setMsg("No product loaded");
    const payload = { id: product.id, name, price, description: desc };

    try {
      const res = await fetch(`${BASE}/product/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (res.ok) {
        setMsg("Updated (JSON). Server: " + text);
        onUpdate?.(text);
      } else {
        setMsg("Failed to update (JSON): " + text);
      }
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div>
      <h4>Update product</h4>
      <form onSubmit={submitAsJson}>
        <div>
          <label>Name: <input value={name} onChange={e => setName(e.target.value)} /></label>
        </div>
        <div>
          <label>Price: <input value={price} onChange={e => setPrice(e.target.value)} /></label>
        </div>
        <div>
          <label>Description:<br />
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} cols={40} />
          </label>
        </div>
        <div style={{ marginTop: 6 }}>
          <button type="submit">Update (send JSON)</button>
        </div>
      </form>
      <div style={{ marginTop: 8 }}>{msg}</div>
    </div>
  );
}

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const forceRefresh = () => setRefreshKey(k => k + 1);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Strona testowa</h1>
      {!selectedId && (
        <ProductsList
          key={refreshKey}
          onSelect={(id) => setSelectedId(id)}
        />
      )}
      {selectedId && (
        <ProductDetails
          id={selectedId}
          onBack={() => setSelectedId(null)}
          refreshList={forceRefresh}
        />
      )}
    </div>
  );
}
