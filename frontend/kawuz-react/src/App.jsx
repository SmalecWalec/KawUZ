import React, { useEffect, useState, useCallback } from "react";
// Zakładane importy zewnętrznych komponentów
import AdminPanel from './AdminPanel';
import Register from "./Register";
import Cart from "./Cart";
import Login from './Login';
import "./App.css"

const BASE = "http://localhost:8080/api";

const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

// --- Pomocnicze ładowanie obrazów (Metoda Publiczna) ---
const getProductImage = (productName) => {
    const encodedName = encodeURIComponent(productName);
    const imageUrl = `/images/${encodedName}.png`;
    const mockImageUrl = "https://via.placeholder.com/80x80?text=Kawa";
    return imageUrl || mockImageUrl;
};

// --- UpdateProductForm ---
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
                credentials: 'include',
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

// --- ProductsList Component ---
function ProductsList({ onSelect, onAddToCart }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [search, setSearch] = useState("");

    const fetchProducts = useCallback((keyword = "") => {
        setLoading(true);
        setErr(null);
        let url = `${BASE}/products`;
        if (keyword) url = `${BASE}/product/search?keyword=${encodeURIComponent(keyword)}`;

        fetch(url, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => setProducts(data))
            .catch(e => setErr(e.message))
            .finally(() => setLoading(false));
    }, []);

    const debouncedFetchProducts = useCallback(
        debounce(fetchProducts, 200),
        [fetchProducts] // Pusta tablica zależności, aby funkcja była stała
    );

    useEffect(() => {debouncedFetchProducts(search); return () => {}}, [search, debouncedFetchProducts]);
    // if (loading) return <div>Ładowanie produktów…</div>;
    // if (err) return <div style={{ color: "red" }}>Błąd: {err}</div>;

    return (
        <div className="products-container">
            <h2>Lista Ofert (Kawa)</h2>
            <div style={{ marginBottom: 10 }}>
                <input
                    type="text"
                    placeholder="Szukaj..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ marginRight: 8, padding: 5 }}
                />
            </div>
            <ul style={{ listStyle: 'none', padding: 0, width: "100%" }}>
                {products.map(p => (
                    <li
                        key={p.id}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 15,
                            border: '1px solid #ddd',
                            padding: 10,
                            borderRadius: 5,
                            textAlign: 'left',
                            width: "100%"
                        }}
                    >

                        {/* 1. Zdjęcie - Lewa strona (Użycie getProductImage) */}
                        <div style={{ marginRight: 15, flexShrink: 0,width: "33%", height: "33%" }}>
                            <img
                                src={getProductImage(p.name)}
                                alt={p.name}
                                style={{ width: "100%", height: "100%", objectFit: 'cover', borderRadius: 3 }}
                            />
                        </div>

                        {/* 2. Nazwa i Opis - Środek, na lewo */}
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <h3
                                onClick={() => onSelect(p.id)}
                                style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '1.2em',
                                    cursor: 'pointer',
                                    color: '#007bff'
                                }}
                            >
                                {p.name}
                            </h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {p.description || "Brak opisu produktu."}
                            </p>
                        </div>

                        {/* 3. Cena i Przycisk "Dodaj do koszyka" - Prawa strona */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            marginLeft: 15,
                            flexShrink: 0
                        }}>
                            <b style={{ fontSize: '1.4em', color: '#333', marginBottom: 5 }}>
                                {p.price} zł
                            </b>
                            <button
                                onClick={() => onAddToCart(p)}
                                style={{
                                    padding: "8px 15px",
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: 'none',
                                    borderRadius: 3,
                                    cursor: 'pointer'
                                }}
                            >
                                Dodaj do koszyka
                            </button>
                        </div>

                    </li>
                ))}
            </ul>
        </div>
    );
}

// --- ProductDetails Component ---
function ProductDetails({ id, onBack, refreshList, isEditable = false, onAddToCart }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetch(`${BASE}/product/${id}`, {credentials: 'include'})
            .then(res => {
                if (res.status === 404) throw new Error("Product not found");
                if (!res.ok) throw new Error("Error fetching product");
                return res.json();
            })
            .then(p => setProduct(p))
            .catch(e => setMessage(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    const deleteProduct = () => {
        if (!window.confirm("Delete this product?")) return;
        fetch(`${BASE}/product/${id}`, {
            method: "DELETE",
            credentials: 'include'
        })
            .then(res => res.text().then(text => ({ok: res.ok, status: res.status, text})))
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

    if (loading) return <div>Ładowanie szczegółów...</div>;
    if (message && !product) return <div style={{color: "red"}}>Błąd: {message}</div>;
    if (!product) return null;


    return (
        <div style={{border: '1px solid #555', padding: 20, borderRadius: 8, width: '90%'}}>
            <h3>Szczegóły produktu</h3>

            {/* GŁÓWNY KONTENER SZCZEGÓŁÓW Z UKŁADEM FLEXBOX */}
            <div
                style={{
                    display: 'flex',
                    gap: '15px', // Odstęp między kolumnami
                    alignItems: 'center', // Wyrównanie do góry
                    textAlign: 'left',
                    marginBottom: 20,
                }}
                className={!isEditable ? "product-card" : ""}
            >
                {/* ======================================================= */}
                {/* 1. KOLUMNA LEWA: Obrazek */}
                {/* ======================================================= */}
                <div style={{flexShrink: 0, width: "33%"}}>
                    <img
                        src={getProductImage(product.name)}
                        alt={product.name}
                        style={{width: "100%", height: "33%", objectFit: 'cover', borderRadius: 8}}
                    />
                </div>

                {/* ======================================================= */}
                {/* 2. KOLUMNA ŚRODKOWA: Nazwa i Opis */}
                {/* ======================================================= */}
                <div style={{flexGrow: 1, minWidth: 0, paddingTop: 10,justifyContent: 'center', justifyItems: 'center'}}>
                    <h4 style={{margin: '0 0 10px 0', fontSize: '1.5em'}}>
                        {product.name}
                    </h4>
                    <p style={{margin: '0 0 10px 0', color: '#666'}}>
                        {product.description}
                    </p>
                </div>

                {/* ======================================================= */}
                {/* 3. KOLUMNA PRAWA: Cena, Koszyk i Mapa */}
                {/* ======================================================= */}
                <div style={{
                    flexShrink: 0,
                    width: '25%',
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: "center"
                }}>

                    {/* CENA */}
                    <b style={{fontSize: '2em', color: '#333', marginBottom: 10, marginTop: 1}}>
                        {product.price} zł
                    </b>

                    {/* PRZYCISK KOSZYKA */}
                    {!isEditable && (
                        <button
                            onClick={() => onAddToCart(product)}
                            style={{
                                backgroundColor: "#28a745",
                                color: "white",
                                padding: "10px 20px",
                                border: 'none',
                                borderRadius: 5,
                                cursor: 'pointer',
                                marginBottom: 15
                            }}
                        >
                            Dodaj do koszyka
                        </button>
                    )}

                    {/* LOKALIZACJA I MAPA */}
                    {product && product.map && (
                        <div style={{marginTop: 10, textAlign: 'center', width: '100%'}}>
                            <h4 style={{margin: '5px 0'}}>Miejsce pochodzenia</h4>
                            <iframe
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyB2NIWI3Tv9iDPrlnowr_0ZqZWoAQydKJU&q=$${product.map}&maptype=roadmap`}
                                width="100%"
                                height="75%"
                                style={{border: 0, borderRadius: 5}}
                                allowFullScreen="true"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    )}
                </div>
            </div>
            {/* KONIEC GŁÓWNEGO UKŁADU FLEXBOX */}


            {/* --- Admin Edit/Delete Forms --- */}
            {isEditable && (
                <>
                    <hr/>
                    <UpdateProductForm
                        product={product}
                        onUpdate={(msg) => {
                            setMessage(msg);
                            refreshList?.();
                        }}
                    />
                    <hr/>
                    <button onClick={deleteProduct} style={{backgroundColor: '#b33'}}>Usuń produkt</button>
                </>
            )}
            <div style={{marginTop: 10}}>{message}</div>
        </div>
    );
}
// --- MAIN APP COMPONENT ---
export default function App() {
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    // View State: 'store' | 'login' | 'register'
    const [currentView, setCurrentView] = useState('store');

    // Store State
    const [selectedId, setSelectedId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [mode, setMode] = useState('list'); // 'list' | 'details' | 'admin'
    const [isEditing, setIsEditing] = useState(false);

    // Cart State
    const [cart, setCart] = useState([]);
    const [activeTab, setActiveTab] = useState("products"); // 'products' | 'cart'

    // 1. REHYDRATION (Check Cookie)
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const res = await fetch(`${BASE}/auth/me`, { method: "GET", credentials: "include" });

                if (res.status === 401 || res.status === 403) {
                    console.log("Status logowania: Użytkownik gość (401/403).");
                    setUser(null);
                    return;
                }
                // --------------------------------------------------------

                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                } else {
                    console.error("Błąd uwierzytelnienia (inny niż 401/403):", res.status);
                    setUser(null);
                }
            } catch (err) {
                console.log("Błąd połączenia sieciowego lub serwera.");
                setUser(null);
            }
            finally {
                setIsLoadingUser(false);
            }
        };
        checkLoginStatus();
    }, []);

    // 2. CHECKOUT LOGIC
    const handleCheckout = async () => {
        if (cart.length === 0) return alert("Koszyk jest pusty");

        if (!user) {
            alert("Musisz się zalogować, aby złożyć zamówienie.");
            setCurrentView('login');
            return;
        }

        try {
            const orderItems = cart.map(item => ({ productId: item.id, quantity: 1 }));
            const res = await fetch(`${BASE}/order/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(orderItems),
            });

            if(res.ok) {
                alert("Zamówienie złożone!");
                setCart([]);
                setRefreshKey(k => k+1);
                setActiveTab("products");
            } else {
                alert("Błąd zamówienia");
            }
        } catch(err) {
            alert("Błąd: " + err.message);
        }
    };

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setCurrentView('store');
    };

    const handleLogout = async () => {
        await fetch(`${BASE}/auth/logout`, { method: "POST", credentials: "include" });
        setUser(null);
        setCart([]);
        setMode('list');
        setActiveTab('products');
    };

    // --- RENDER ---

    if (isLoadingUser) return <div>Ładowanie...</div>;

    // 3. MAIN STORE VIEW
    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif', textAlign: 'center' }}>

            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #444', paddingBottom: 10, marginBottom: 20 }}>
                <h1>☕ KawUZ</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {user ? (
                        <>
                            <span>Witaj, <b>{user.username}</b>!</span>
                            {user.isAdmin && (
                                <button onClick={() => { setMode('admin'); setActiveTab('products'); setSelectedId(null); }}>
                                    Panel Admina
                                </button>
                            )}
                            <button onClick={handleLogout}>Wyloguj</button>
                        </>
                    ) : (
                        <button onClick={() => setCurrentView('login')} style={{fontWeight: 'bold', backgroundColor: '#448'}}>
                            Zaloguj się
                        </button>
                    )}
                </div>
            </div>

            {/* CONDITIONAL RENDERING: ADMIN vs STORE */}
            {user?.isAdmin && mode === 'admin' ? (
                /* ADMIN VIEW */
                <div>
                    <button onClick={() => setMode('list')} style={{marginBottom: 10}}>Powrót do sklepu</button>
                    <AdminPanel
                        forceRefresh={() => setRefreshKey(k => k+1)}
                        onEdit={(id) => { setSelectedId(id); setMode('details'); setIsEditing(true); }}
                    />
                </div>
            ) : (
                /* STANDARD STORE VIEW */
                <>
                    {/* TABS */}
                    <div style={{ marginBottom: 20 }}>
                        <button onClick={() => { setActiveTab("products"); setSelectedId(null); setMode('list'); }} style={{ fontWeight: activeTab === "products" ? 'bold' : 'normal' }}>
                            Produkty
                        </button>
                        <button onClick={() => { setActiveTab("cart"); setSelectedId(null); setMode('list'); }} style={{ fontWeight: activeTab === "cart" ? 'bold' : 'normal', marginLeft: 10 }}>
                            Koszyk ({cart.length})
                        </button>
                    </div>

                    {/* CONTENT */}
                    {activeTab === "products" && !selectedId && (
                        <ProductsList key={refreshKey} onSelect={(id) => { setSelectedId(id); setMode('details'); setIsEditing(false); }} onAddToCart={(p) => setCart(prev => [...prev, p])} />
                    )}

                    {activeTab === "products" && selectedId && (
                        <ProductDetails
                            id={selectedId}
                            onBack={() => { setSelectedId(null); setMode('list'); }}
                            onAddToCart={(p) => setCart(prev => [...prev, p])}
                            refreshList={() => setRefreshKey(k => k+1)}
                            isEditable={user?.isAdmin && isEditing}
                        />
                    )}

                    {activeTab === "cart" && (
                        <Cart
                            cart={cart}
                            onRemove={(idx) => setCart(prev => prev.filter((_, i) => i !== idx))}
                            onCheckout={handleCheckout}
                        />
                    )}
                </>
            )}
            {currentView === 'login' && (
                <Login
                    onSwitchToRegister={() => setCurrentView('register')}
                    onLoginSuccess={handleLoginSuccess}
                    onCancel={() => setCurrentView('store')}
                    isModal={true}
                    onClose={() => setCurrentView('store')}
                />
            )}
        </div>
    );
}