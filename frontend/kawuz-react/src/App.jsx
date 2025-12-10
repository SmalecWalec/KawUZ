import React, { useEffect, useState } from "react";
import AdminPanel from './AdminPanel'; // Ensure this component also uses credentials: 'include' internally if it fetches data
import Register from "./Register";
import Cart from "./Cart";

const BASE = "http://localhost:8080/api";

// --- Login Component (Updated) ---
function Login({ onSwitchToRegister, onLoginSuccess }) {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [msg, setMsg] = useState('');

    const handleLogin = async () => {
        try {
            const res = await fetch(`${BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // <--- CRITICAL: Allows browser to save the cookie
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setMsg("✅ Zalogowano!");
                setTimeout(() => onLoginSuccess({
                    username: data.username,
                    isAdmin: data.isAdmin
                }), 1000);
            } else {
                setMsg("⚠️ " + data.message);
            }
        } catch (err) {
            setMsg("Błąd połączenia.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin();
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{ padding: 20, border: '1px solid #ccc', margin: '20px auto', maxWidth: 300, background: '#222', color: 'white' }}
        >
            <h3>Logowanie</h3>
            <input placeholder="Login" onChange={e => setFormData({...formData, username: e.target.value})} style={{ marginBottom: 10, padding: 5, width: '90%' }}/><br/>
            <input type="password" placeholder="Hasło" onChange={e => setFormData({...formData, password: e.target.value})} style={{ marginBottom: 10, padding: 5, width: '90%' }}/><br/>
            <button type="submit">Zaloguj się</button>
            <p>{msg}</p>
            <button onClick={onSwitchToRegister} type="button" style={{ background: 'none', border: 'none', color: '#88f', cursor: 'pointer', marginTop: 10 }}>Nie mam konta</button>
        </form>
    );
}

// --- ProductsList (Updated) ---
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

        fetch(url, { credentials: 'include' }) // Added credentials
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
                    <li key={p.id} style={{marginBottom: 5, display: 'flex', alignItems: 'center'}}>
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

// --- ProductDetails (Updated) ---
function ProductDetails({ id, onBack, refreshList, isEditable = false, onAddToCart }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetch(`${BASE}/product/${id}`, { credentials: 'include' }) // Added credentials
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
        fetch(`${BASE}/product/${id}`, {
            method: "DELETE",
            credentials: 'include' // Added credentials
        })
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

    const baseStyle = { border: '1px solid #555', padding: 20, borderRadius: 8 };

    return (
        <div style={isEditable ? baseStyle : baseStyle}>
            <button onClick={onBack}>← Wróć do listy</button>
            <h3>Szczegóły produktu</h3>
            {product && (
                <div style={isEditable ? {textAlign: 'left'} : {}} className={!isEditable ? "product-card" : ""}>
                    <div><strong>ID:</strong> {product.id}</div>
                    <div><strong>Name:</strong> {product.name}</div>
                    <div><strong>Price:</strong> {product.price}</div>
                    <div><strong>Description:</strong> {product.description}</div>
                    {!isEditable && (
                        <button
                            onClick={() => onAddToCart(product)}
                            style={{ marginTop: 10, padding: "5px 10px", backgroundColor: "#4a4", color: "white" }}>
                            Dodaj do koszyka
                        </button>
                    )}
                </div>
            )}
            {/* Map iframe code remains same */}
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

// --- UpdateProductForm (Updated) ---
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
                credentials: 'include', // Added credentials
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


// --- MAIN APP COMPONENT ---

export default function App() {
    const [user, setUser] = useState(null);
    const [authView, setAuthView] = useState('login');
    const [isLoadingUser, setIsLoadingUser] = useState(true); // Prevents flickering on refresh

    // Stany dla widoków
    const [selectedId, setSelectedId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const forceRefresh = () => setRefreshKey(k => k + 1);
    const [mode, setMode] = useState('list');
    const [isEditing, setIsEditing] = useState(false);

    // Stany dla koszyka
    const [cart, setCart] = useState([]);
    const [activeTab, setActiveTab] = useState("products");

    // --- 1. REHYDRATION LOGIC (CHECK COOKIE ON LOAD) ---
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                // Calls the backend endpoint that checks the httpOnly cookie
                const res = await fetch(`${BASE}/auth/me`, {
                    method: "GET",
                    credentials: "include"
                });

                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData); // Restore user session
                }
            } catch (err) {
                console.log("No valid session found");
            } finally {
                setIsLoadingUser(false); // Stop loading regardless of result
            }
        };
        checkLoginStatus();
    }, []);

    // Funkcje koszyka
    const addToCart = (product) => {
        setCart(prev => [...prev, product]);
        setActiveTab("products");
    };
    const removeFromCart = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const handleCheckout = async () => {
        if(cart.length === 0) return alert("Koszyk jest pusty");
        const orderItems = cart.map(item => ({ productId: item.id, quantity: 1 }));

        try {
            const res = await fetch(`${BASE}/order/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include', // Added credentials
                body: JSON.stringify(orderItems),
            });

            if(res.ok) {
                alert("Zamówienie złożone!");
                setCart([]);
                forceRefresh();
                setActiveTab("products");
            } else {
                const text = await res.text();
                alert("Błąd: " + text);
            }
        } catch(err) {
            alert("Błąd: " + err.message);
        }
    };


    const handleLogout = async () => {
        try {
            // Must call backend to clear the cookie
            await fetch(`${BASE}/auth/logout`, {
                method: "POST",
                credentials: "include"
            });
        } catch(e) {
            console.error("Logout failed", e);
        }

        setUser(null);
        setAuthView('login');
        setMode('list');
        setActiveTab('products');
        setCart([]);
    };

    const returnToListMode = () => {
        setSelectedId(null);
        setMode('list');
        setIsEditing(false);
        setActiveTab('products');
    };

    const handleViewProduct = (id) => {
        setSelectedId(id);
        setMode('details');
        setIsEditing(false);
        setActiveTab('products');
    };

    const handleEditProduct = (id) => {
        setSelectedId(id);
        setMode('details');
        setIsEditing(true);
        setActiveTab('products');
    };

    // --- 0. WIDOK ŁADOWANIA (Zapobiega miganiu ekranu logowania) ---
    if (isLoadingUser) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <h2>☕ Ładowanie KawUZ...</h2>
            </div>
        );
    }

    // --- 1. WIDOK BEZ AUTORYZACJI (LOGOWANIE / REJESTRACJA) ---
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

    // --- 2. WIDOK PO ZALOGOWANIU ---

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

    // Główny widok listy/szczegółów/koszyka (dla zalogowanych)
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
                <h1>☕ KawUZ</h1>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ marginBottom: user.isAdmin ? 5 : 0 }}>
                        <span>Witaj, <b>{user.username}</b>! </span>
                        <button onClick={handleLogout} style={{marginLeft: 10, padding: '5px 10px'}}>Wyloguj</button>
                    </div>

                    {user.isAdmin && (
                        <button
                            onClick={() => {setMode('admin'); setActiveTab('products'); setSelectedId(null);}}
                            className="admin-button"
                            style={{ padding: '5px 10px' }}
                        >
                            Przejdź do Panelu Admina
                        </button>
                    )}
                </div>
            </div>

            {/* Zakładki dla Użytkownika (Produkty / Koszyk) */}
            <div style={{ marginBottom: 20 }}>
                <button
                    onClick={() => { setActiveTab("products"); setSelectedId(null); setMode('list'); setIsEditing(false); }}
                    style={{ marginRight: 10, fontWeight: activeTab === "products" ? 'bold' : 'normal' }}
                >
                    Produkty
                </button>
                <button
                    onClick={() => { setActiveTab("cart"); setSelectedId(null); setMode('list'); setIsEditing(false); }}
                    style={{ fontWeight: activeTab === "cart" ? 'bold' : 'normal' }}
                >
                    Koszyk ({cart.length})
                </button>
            </div>

            {/* WIDOK PRODUKTÓW */}
            {activeTab === "products" && !selectedId && mode === 'list' && (
                <ProductsList
                    key={refreshKey}
                    onSelect={handleViewProduct}
                    onAddToCart={addToCart}
                />
            )}

            {activeTab === "products" && selectedId && mode === 'details' && (
                <ProductDetails
                    id={selectedId}
                    onBack={returnToListMode}
                    refreshList={forceRefresh}
                    isEditable={isEditing && user.isAdmin}
                    onAddToCart={addToCart}
                />
            )}

            {/* WIDOK KOSZYKA */}
            {activeTab === "cart" && (
                <Cart
                    cart={cart}
                    onRemove={removeFromCart}
                    onCheckout={handleCheckout}
                />
            )}
        </div>
    );
}