// src/App.jsx
import React, { useEffect, useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Cart from "./Cart";

const BASE = "http://localhost:8080/api";

function ProductsList({ onSelect, onAddToCart }) {
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
      <h2 style={{color: 'white'}}>Lista Ofert (Kawa)</h2>
      {/* Wyszukiwarka */}
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Szukaj produktów..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginRight: 8, padding: 5 }}
        />
        <button onClick={() => fetchProducts(search)}>Szukaj</button>
      </div>
      <ul style={{ textAlign: "left" }}>
        {products.map(p => (
          <li key={p.id} style={{ marginBottom: 5 }}>
            <button onClick={() => onSelect(p.id)} style={{ marginRight: 8 }}>
              Podgląd
            </button>
            {p.name ?? `Product ${p.id}`} — <b>{p.price ?? "?"} zł</b>
            <button
              onClick={() => onAddToCart(p)}
              style={{ marginLeft: 10, padding: "2px 5px", backgroundColor: "#4a4", color: "white" }}>
              Dodaj do koszyka
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductDetails({ id, onBack, refreshList, onAddToCart }) {
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
          setTimeout(onBack, 1000);
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
    <div style={{ border: "1px solid #555", padding: 20, borderRadius: 8 }}>
      <button onClick={onBack}>← Wróć do listy</button>
      <h3>Szczegóły produktu</h3>
      {product && (
        <div style={{ textAlign: "left" }}>
          <div><strong>ID:</strong> {product.id}</div>
          <div><strong>Nazwa:</strong> {product.name}</div>
          <div><strong>Cena:</strong> {product.price} zł</div>
          <div><strong>Opis:</strong> {product.description}</div>
          <button
            onClick={() => onAddToCart(product)} style={{ marginTop: 10, padding: "5px 10px", backgroundColor: "#4a4", color: "white" }}>
            Dodaj do koszyka
          </button>
        </div>
      )}
      <hr />
      <button onClick={deleteProduct} style={{ backgroundColor: "#b33", color: "white" }}>
        Usuń produkt
      </button>
      <div style={{ marginTop: 10 }}>{message}</div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState("login");
  const [selectedId, setSelectedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState("products"); // 'products' lub 'cart'

  const forceRefresh = () => setRefreshKey(k => k + 1);
  const handleLogout = () => { setUser(null); setAuthView("login"); };

  const addToCart = (product) => setCart(prev => [...prev, product]);
  const removeFromCart = (index) => setCart(prev => prev.filter((_, i) => i !== index));

  const handleCheckout = async () => {
    if(cart.length === 0) return alert("Koszyk jest pusty");
    const orderItems = cart.map(item => ({ productId: item.id, quantity: 1 }));

    try {
      const res = await fetch(`${BASE}/order/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderItems),
      });

      if(res.ok) {
        alert("Zamówienie złożone!");
        setCart([]);
        forceRefresh();
      } else {
        const text = await res.text();
        alert("Błąd: " + text);
      }
    } catch(err) {
      alert("Błąd: " + err.message);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <h1>☕ KawUZ System</h1>
        {authView === "login" ? (
          <Login
            onSwitchToRegister={() => setAuthView("register")}
            onLoginSuccess={(username) => setUser(username)}
          />
        ) : (
          <Register
            onSwitchToLogin={() => setAuthView("login")}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #444", paddingBottom: 10, marginBottom: 20 }}>
        <h1>☕ Panel KawUZ</h1>
        <div>
          <span>Witaj, <b>{user}</b>! </span>
          <button onClick={handleLogout} style={{ marginLeft: 10, padding: "5px 10px" }}>Wyloguj</button>
        </div>
      </div>

      {/* Zakładki */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setActiveTab("products")} style={{ marginRight: 10 }}>Produkty</button>
        <button onClick={() => setActiveTab("cart")}>Koszyk ({cart.length})</button>
      </div>

      {activeTab === "products" && !selectedId && (
        <ProductsList key={refreshKey} onSelect={id => setSelectedId(id)} onAddToCart={addToCart} />
      )}

      {activeTab === "products" && selectedId && (
        <ProductDetails
          id={selectedId}
          onBack={() => setSelectedId(null)}
          refreshList={forceRefresh}
          onAddToCart={addToCart}
        />
      )}

      {activeTab === "cart" && (
        <Cart cart={cart} onRemove={removeFromCart} onCheckout={handleCheckout} />
      )}
    </div>
  );
}
