import React, { useEffect, useState, useCallback } from "react";
// Zakładane importy zewnętrznych komponentów
import AdminPanel from './AdminPanel';
import Register from "./Register";
import Cart from "./Cart";
import Login from './Login';
import "./css/App.css"

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

const getProductImage = (productName) => {
    const encodedName = encodeURIComponent(productName);
    const imageUrl = `/images/${encodedName}.png`;
    const mockImageUrl = "https://via.placeholder.com/80x80?text=Kawa";
    return imageUrl || mockImageUrl;
};

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
            <div style={{ marginTop: 8, color: 'var(--text)' }}>{msg}</div>
        </div>
    );
}

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
        [fetchProducts]
    );

    useEffect(() => {debouncedFetchProducts(search); return () => {}}, [search, debouncedFetchProducts]);

    return (
        <div className="products-container">
            <h2>Lista Ofert (Kawa)</h2>
            <div style={{ marginBottom: 10 }}>
                <input
                    type="text"
                    placeholder="Szukaj..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="search-input"
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
                            padding: 10,
                            borderRadius: 10,
                            textAlign: 'left',
                            width: "100%",
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        className="productElement"
                        onClick={() => onSelect(p.id)}
                    >
                        <div style={{ marginRight: 15, flexShrink: 0,width: "33%", height: "33%" }}>
                            <img
                                src={getProductImage(p.name)}
                                alt={p.name}
                                style={{ width: "100%", height: "100%", objectFit: 'cover', borderRadius: 3 }}
                            />
                        </div>

                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <h3 className="name" style={{ margin: '0 0 5px 0', fontSize: '1.2em' }}>
                                {p.name}
                            </h3>
                            <p className="description" style={{ margin: 0, fontSize: '0.9em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                                {p.description || "Brak opisu produktu."}
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 15, flexShrink: 0 }}>
                            {p.stockQuantity>=1 && <h5>TOWAR DOSTĘPNY NA MAGAZYNIE</h5>}
                            {p.stockQuantity<=0 && <h5>TOWAR NIEDOSTEPNY</h5>}
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <b className="price">
                                    {p.price} zł
                                </b>
                                <p class="description">brutto</p>
                            </div>
                            <button
                                onClick={() => onAddToCart(p)}
                                className="btnCart"
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

    if (loading) return <div style={{color: 'var(--text)'}}>Ładowanie szczegółów...</div>;
    if (message && !product) return <div style={{color: "var(--danger)"}}>Błąd: {message}</div>;
    if (!product) return null;

    return (
        <div style={{border: '1px solid var(--border)', padding: 20, borderRadius: 8, width: '90%', backgroundColor: 'var(--bg)'}}>
            <h3 style={{color: 'var(--heading)'}}>Szczegóły produktu</h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', textAlign: 'left', marginBottom: 20 }} className={"product-card"}>
                <div style={{flexShrink: 0, width: "40%"}}>
                    <img src={getProductImage(product.name)} alt={product.name} style={{width: "100%", height: "33%", objectFit: 'cover', borderRadius: 8}} />
                </div>

                <div style={{flexShrink: 0, width: '60%', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center"}}>
                    <h4 style={{margin: '0 0 10px 0', fontSize: '1.5em', color: 'var(--heading)'}}>{product.name}</h4>
                    <p style={{margin: '0 0 10px 0', color: 'var(--color-description)'}}>{product.description}</p>
                    <b style={{fontSize: '2em', color: 'var(--text)', marginBottom: 10, marginTop: 1}}>{product.price} zł</b>

                    {!isEditable && (
                        <button
                            onClick={() => onAddToCart(product)}
                            style={{backgroundColor: "var(--btn-bg)", color: "var(--text)", padding: "10px 20px", border: 'none', borderRadius: 5, cursor: 'pointer', marginBottom: 15}}
                        >
                            Dodaj do koszyka
                        </button>
                    )}

                    {product && product.map && (
                        <div style={{marginTop: 10, textAlign: 'center', width: '100%'}}>
                            <h4 style={{margin: '5px 0', color: 'var(--heading)'}}>Miejsce pochodzenia</h4>
                            <iframe
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyB2NIWI3Tv9iDPrlnowr_0ZqZWoAQydKJU&q=$${product.map}&maptype=roadmap`}
                                width="50%"
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

            {isEditable && (
                <>
                    <hr/>
                    <UpdateProductForm
                        product={product}
                        onUpdate={(msg) => { setMessage(msg); refreshList?.(); }}
                    />
                    <hr/>
                    <button onClick={deleteProduct} style={{backgroundColor: 'var(--danger)', color: 'white'}}>Usuń produkt</button>
                </>
            )}
            <div style={{marginTop: 10, color: 'var(--text)'}}>{message}</div>
        </div>
    );
}

export default function App() {
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    const [currentView, setCurrentView] = useState('store');

    const [selectedId, setSelectedId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [mode, setMode] = useState('list');
    const [isEditing, setIsEditing] = useState(false);

    const [cart, setCart] = useState([]);
    const [activeTab, setActiveTab] = useState("products");

    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if(saved) {
            setTheme(saved);
            document.documentElement.classList.toggle('dark', saved === 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);
    }

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const res = await fetch(`${BASE}/auth/me`, { method: "GET", credentials: "include" });
                if (res.status === 401 || res.status === 403) { setUser(null); return; }
                if (res.ok) { const userData = await res.json(); setUser(userData); }
                else setUser(null);
            } catch { setUser(null); }
            finally { setIsLoadingUser(false); }
        };
        checkLoginStatus();
    }, []);

    const handleCheckout = async () => {
        if (cart.length === 0) return alert("Koszyk jest pusty");
        if (!user) { alert("Musisz się zalogować, aby złożyć zamówienie."); setCurrentView('login'); return; }

        try {
            const orderItems = cart.map(item => ({ productId: item.id, quantity: 1 }));
            const res = await fetch(`${BASE}/order/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(orderItems),
            });

            if(res.ok) { alert("Zamówienie złożone!"); setCart([]); setRefreshKey(k => k+1); setActiveTab("products"); }
            else alert("Błąd zamówienia");
        } catch(err) { alert("Błąd: " + err.message); }
    };

    const handleLoginSuccess = (userData) => { setUser(userData); setCurrentView('store'); };
    const handleLogout = async () => { await fetch(`${BASE}/auth/logout`, { method: "POST", credentials: "include" }); setUser(null); setCart([]); setMode('list'); setActiveTab('products'); };

    if (isLoadingUser) return <div style={{color: 'var(--text)'}}>Ładowanie...</div>;

    return (
        <div className={theme} style={{ padding: 20, fontFamily: 'sans-serif', textAlign: 'center' }}>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
                <h1 style={{color: 'var(--heading)'}}>☕ KawUZ</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {user ? (
                        <>
                            <span style={{color: 'var(--text)'}}>Witaj, <b>{user.username}</b>!</span>
                            {user.isAdmin && (
                                <button onClick={() => { setMode('admin'); setActiveTab('products'); setSelectedId(null); }}>
                                    Panel Admina
                                </button>
                            )}
                            <button onClick={handleLogout}>Wyloguj</button>
                        </>
                    ) : (
                        <button onClick={() => setCurrentView('login')} style={{fontWeight: 'bold', backgroundColor: 'var(--btn-bg)', color: 'var(--text)'}}>
                            Zaloguj się
                        </button>
                    )}
                    <button onClick={toggleTheme} style={{padding: '10px 10px'}}>
                        {theme === 'light' ? 'Tryb ciemny' : 'Tryb jasny'}
                    </button>
                </div>
            </div>

            {user?.isAdmin && mode === 'admin' ? (
                <div>
                    <button onClick={() => setMode('list')} style={{marginBottom: 10}}>Powrót do sklepu</button>
                    <AdminPanel
                        forceRefresh={() => setRefreshKey(k => k+1)}
                        onEdit={(id) => { setSelectedId(id); setMode('details'); setIsEditing(true); }}
                    />
                </div>
            ) : (
                <>
                    <div style={{ marginBottom: 20 }}>
                        <button onClick={() => { setActiveTab("products"); setSelectedId(null); setMode('list'); }} style={{ fontWeight: activeTab === "products" ? 'bold' : 'normal' }}>
                            Produkty
                        </button>
                        <button onClick={() => { setActiveTab("cart"); setSelectedId(null); setMode('list'); }} style={{ fontWeight: activeTab === "cart" ? 'bold' : 'normal', marginLeft: 10 }}>
                            Koszyk ({cart.length})
                        </button>
                    </div>

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
