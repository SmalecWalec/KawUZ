import React, { useEffect, useState } from "react";
// Ensure these components exist in your project, or remove/comment them if not
import AdminPanel from './AdminPanel';
import Register from "./Register";
import Cart from "./Cart";

const BASE = "http://localhost:8080/api";

// --- Login Component ---
function Login({ onSwitchToRegister, onLoginSuccess, onCancel }) {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [msg, setMsg] = useState('');

    const handleLogin = async () => {
        try {
            const res = await fetch(`${BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setMsg("✅ Zalogowano!");
                setTimeout(() => onLoginSuccess({
                    username: data.username,
                    isAdmin: data.isAdmin
                }), 500);
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

            <button type="submit" style={{marginRight: 10}}>Zaloguj się</button>
            <button type="button" onClick={onCancel} style={{background: '#777'}}>Anuluj</button>

            <p>{msg}</p>
            <button onClick={onSwitchToRegister} type="button" style={{ background: 'none', border: 'none', color: '#88f', cursor: 'pointer', marginTop: 10 }}>Nie mam konta</button>
        </form>
    );
}

// --- ProductsList Component ---
function ProductsList({ onSelect, onAddToCart }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [search, setSearch] = useState("");

    const fetchProducts = (keyword = "") => {
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
    };

    useEffect(() => { fetchProducts(); }, []);

    if (loading) return <div>Loading products…</div>;
    if (err) return <div style={{ color: "red" }}>Error: {err}</div>;

    return (
        <div>
            <h2>Lista Ofert (Kawa)</h2>
            <div style={{ marginBottom: 10 }}>
                <input type="text" placeholder="Szukaj..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginRight: 8, padding: 5 }} />
                <button onClick={() => fetchProducts(search)}>Szukaj</button>
            </div>
            <ul style={{textAlign: 'left'}}>
                {products.map(p => (
                    <li key={p.id} style={{marginBottom: 5, display: 'flex', alignItems: 'center'}}>
                        <button onClick={() => onSelect(p.id)} style={{ marginRight: 8 }}>Podgląd</button>
                        {p.name} — <b>{p.price} zł</b>
                        <button onClick={() => onAddToCart(p)} style={{ marginLeft: 10, padding: "2px 5px", backgroundColor: "#4a4", color: "white" }}>
                            Dodaj do koszyka
                        </button>
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

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetch(`${BASE}/product/${id}`, { credentials: 'include' })
            .then(res => res.json())
            .then(p => setProduct(p))
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [id]);

    if (!product) return <div>Loading...</div>;

    return (
        <div style={{ border: '1px solid #555', padding: 20, borderRadius: 8 }}>
            <button onClick={onBack}>← Wróć do listy</button>
            <h3>{product.name}</h3>
            <div>Cena: {product.price}</div>
            <p>{product.description}</p>
            {!isEditable && (
                <button onClick={() => onAddToCart(product)} style={{ marginTop: 10, backgroundColor: "#4a4", color: "white" }}>
                    Dodaj do koszyka
                </button>
            )}
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
                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                }
            } catch (err) { console.log("Guest User"); }
            finally { setIsLoadingUser(false); }
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

    if (currentView === 'login') {
        return (
            <div style={{textAlign: 'center', marginTop: 50}}>
                <Login
                    onSwitchToRegister={() => setCurrentView('register')}
                    onLoginSuccess={handleLoginSuccess}
                    onCancel={() => setCurrentView('store')}
                />
            </div>
        );
    }

    if (currentView === 'register') {
        return (
            <div style={{textAlign: 'center', marginTop: 50}}>
                <Register onSwitchToLogin={() => setCurrentView('login')} />
                <button onClick={() => setCurrentView('store')} style={{marginTop: 20}}>Anuluj</button>
            </div>
        );
    }

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
                        <ProductsList key={refreshKey} onSelect={(id) => { setSelectedId(id); setMode('details'); }} onAddToCart={(p) => setCart(prev => [...prev, p])} />
                    )}

                    {activeTab === "products" && selectedId && (
                        <ProductDetails
                            id={selectedId}
                            onBack={() => { setSelectedId(null); setMode('list'); }}
                            onAddToCart={(p) => setCart(prev => [...prev, p])}
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
        </div>
    );
}