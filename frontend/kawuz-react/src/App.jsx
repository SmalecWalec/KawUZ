// src/App.jsx

import React, { useEffect, useState } from "react";
import AdminPanel from './AdminPanel';
import Login from "./Login";
import Register from "./Register";

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
            <h2>Lista Ofert (Kawa)</h2>
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

            <ul style={{textAlign: 'left'}}>
                {products.map(p => (
                    <li key={p.id} style={{marginBottom: 5}}>
                        <button onClick={() => onSelect(p.id)} style={{ marginRight: 8 }}>
                            Podgląd
                        </button>
                        {p.name ?? `Product ${p.id}`} — <b>{p.price ?? "?"} zł</b>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ProductDetails({ id, onBack, refreshList, isEditable = false }) {
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
        <div style={isEditable ? {border: '1px solid #555', padding: 20, borderRadius: 8} : {}}>
            <button onClick={onBack}>← Wróć do listy</button>
            <h3>Szczegóły produktu</h3>
            {product && (
                <div style={isEditable ? {textAlign: 'left'} : {}} className={!isEditable ? "product-card" : ""}>
                    <div><strong>ID:</strong> {product.id}</div>
                    <div><strong>Name:</strong> {product.name}</div>
                    <div><strong>Price:</strong> {product.price}</div>
                    <div><strong>Description:</strong> {product.description}</div>
                </div>
            )}
            {product && product.latitude && product.longitude && (
                <div style={{ marginBottom: 20, textAlign: 'center' }}>
                    <h4>Lokalizacja na mapie</h4>
                    <iframe
                        src={`https://maps.google.com/maps?q=${product.latitude},${product.longitude}&z=15&output=embed`}
                        width="25%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Lokalizacja ${product.name}`}
                    ></iframe>
                </div>
            )}
            {isEditable && (
                <>
                    <hr />
                    <UpdateProductForm
                        product={product}
                        onUpdate={(msg) => { setMessage(msg); refreshList?.(); }}
                    />
                    <hr />
                    <button onClick={deleteProduct} style={{backgroundColor: '#b33'}}>Usuń produkt</button>
                </>
            )}
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
                setMsg("Zaktualizowano!");
                onUpdate?.(text);
            } else {
                setMsg("Błąd aktualizacji: " + text);
            }
        } catch (err) {
            setMsg(err.message);
        }
    };

    return (
        <div>
            <h4>Edytuj produkt</h4>
            <form onSubmit={submitAsJson} style={{display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: 'auto'}}>
                <label>Nazwa: <input value={name} onChange={e => setName(e.target.value)} /></label>
                <label>Cena: <input value={price} onChange={e => setPrice(e.target.value)} /></label>
                <label>Opis:<br />
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} cols={30} />
                </label>
                <button type="submit">Zapisz zmiany</button>
            </form>
            <div style={{ marginTop: 8 }}>{msg}</div>
        </div>
    );
}


// --- GŁÓWNY KOMPONENT APP() ---

export default function App() {
    const [user, setUser] = useState(null);
    const [authView, setAuthView] = useState('login');

    // Stany dla widoków
    const [selectedId, setSelectedId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const forceRefresh = () => setRefreshKey(k => k + 1);
    const [mode, setMode] = useState('list');
    const [isEditing, setIsEditing] = useState(false);

    const handleLogout = () => {
        setUser(null);
        setAuthView('login');
        setMode('list');
    };
    const returnToListMode = () => {
        setSelectedId(null);
        setMode('list');
        setIsEditing(false);
    };

    const handleViewProduct = (id) => {
        setSelectedId(id);
        setMode('details');
        setIsEditing(false);
    };

    const handleEditProduct = (id) => {
        setSelectedId(id);
        setMode('details');
        setIsEditing(true);
    };

    // 1. WIDOK BEZ AUTORYZACJI (LOGOWANIE / REJESTRACJA)
    if (!user) {
        return (
            <div style={{ textAlign: 'center', marginTop: 50 }}>
                <h1>☕ KawUZ System</h1>
                {authView === 'login' ? (
                    <Login
                        onSwitchToRegister={() => setAuthView('register')}
                        onLoginSuccess={(userData) => setUser(userData)}
                    />
                ) : (
                    <Register
                        onSwitchToLogin={() => setAuthView('login')}
                    />
                )}
            </div>
        );
    }

    // 2. WIDOK PO ZALOGOWANIU

    // Obsługa trybu Admina
    if (mode === 'admin' && user.isAdmin) {
        return (
            <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
                <h1>Panel Administracyjny</h1>
                <button onClick={returnToListMode}>Powrót do strony głównej</button>
                <AdminPanel
                    forceRefresh={forceRefresh}
                    onEdit={handleEditProduct}
                />
            </div>
        );
    }

    // Główny widok listy/szczegółów
    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif', textAlign: 'center' }}>

            {/* Nagłówek i Wylogowanie */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #444',
                paddingBottom: 10,
                marginBottom: 20
            }}>
                <h1>☕ Panel KawUZ</h1>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ marginBottom: user.isAdmin ? 5 : 0 }}>
                        <span>Witaj, <b>{user.username}</b>! </span>
                        <button onClick={handleLogout} style={{marginLeft: 10, padding: '5px 10px'}}>Wyloguj</button>
                    </div>

                    {user.isAdmin && (
                        <button
                            onClick={() => setMode('admin')}
                            className="admin-button"
                            style={{ padding: '5px 10px' }}
                        >
                            Przejdź do Panelu Admina
                        </button>
                    )}
                </div>
            </div>

            {!selectedId && mode === 'list' && (
                <ProductsList
                    key={refreshKey}
                    onSelect={handleViewProduct}
                />
            )}

            {selectedId && mode === 'details' && (
                <ProductDetails
                    id={selectedId}
                    onBack={returnToListMode}
                    refreshList={forceRefresh}
                    isEditable={isEditing && user.isAdmin}
                />
            )}
        </div>
    );
}