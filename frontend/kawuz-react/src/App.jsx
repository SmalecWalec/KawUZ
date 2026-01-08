import React, { useEffect, useState } from "react";
import {Routes, Route, useNavigate, Navigate, useSearchParams} from "react-router-dom";
import { slugify } from "./helpers.js"
import ProductDetailsWrapper from './ProductDetails';
import ProductsList from "./ProductsList";
import AdminPanel from './AdminPanel';
import Cart from "./Cart";
import Login from './Login';
import Register from './Register';
import "./css/App.css"

const BASE = "http://localhost:8080/api";

export default function App() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeModal = searchParams.get("modal");

    const [refreshKey, setRefreshKey] = useState(0);
    const [mode, setMode] = useState('list');
    const [isEditing, setIsEditing] = useState(false);

    const [cart, setCart] = useState([]);

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
        if (!user) { alert("Musisz się zalogować, aby złożyć zamówienie."); setActiveModal('login'); return; }

        try {
            const orderItems = cart.map(item => ({ productId: item.id, quantity: 1 }));
            const res = await fetch(`${BASE}/order/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(orderItems),
            });

            if(res.ok) { alert("Zamówienie złożone!"); setCart([]); setRefreshKey(k => k+1); navigate('cart'); }
            else alert("Błąd zamówienia");
        } catch(err) { alert("Błąd: " + err.message); }
    };

    const handleLogout = async () => { await fetch(`${BASE}/auth/logout`, { method: "POST", credentials: "include" }); setUser(null); setCart([]); setMode('list'); setActiveTab('products'); };

    if (isLoadingUser) return <div style={{color: 'var(--text)'}}>Ładowanie...</div>;

    const setActiveModal = (type) => {
        if (type) {
            setSearchParams({ modal: type }); // Ustawia ?modal=login
        } else {
            setSearchParams({}); // Usuwa parametry, co zamknie modal
        }
    };

    return (
        <div className={theme} style={{ padding: 20, fontFamily: 'sans-serif', textAlign: 'center' }}>

            {/* --- HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 20 }}>
                <h1 onClick={() => navigate('/')} style={{cursor: 'pointer', color: 'var(--heading)'}}>☕ KawUZ</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {user ? (
                        <>
                            <span style={{color: 'var(--text)'}}>Witaj, <b>{user.username}</b>!</span>
                            {user.isAdmin && (
                                <button onClick={() => navigate('/admin')}>Panel Admina</button>
                            )}
                            <button onClick={handleLogout}>Wyloguj</button>
                        </>
                    ) : (
                        <button onClick={() => setActiveModal('login')} style={{fontWeight: 'bold', backgroundColor: 'var(--btn-bg)', color: 'var(--text)'}}>
                            Zaloguj się
                        </button>
                    )}
                    <button onClick={() => navigate('/cart')} style={{ marginLeft: 10 }}>
                        Koszyk ({cart.length})
                    </button>
                    <button onClick={toggleTheme} style={{padding: '10px 10px'}}>
                        {theme === 'light' ? 'Tryb ciemny' : 'Tryb jasny'}
                    </button>
                </div>
            </div>

            {/* --- TREŚĆ ZMIENNA (ROUTES) --- */}
            <Routes>
                <Route path="/admin" element={
                    user?.isAdmin ? (
                        <div>
                            <AdminPanel
                                forceRefresh={() => setRefreshKey(k => k + 1)}
                                onEdit={(id) => navigate(`/product/${id}?edit=true`)}
                            />
                        </div>
                    ) : (
                        // Jeśli nie jest adminem, przekieruj na stronę główną
                        <Navigate to="/" replace />
                    )
                } />
                <Route path="/" element={<ProductsList
                    key={refreshKey}
                    onSelect={(p) => navigate(`/product/${p.id}-${slugify(p.name)}`)}
                    onAddToCart={(p) => setCart(prev => [...prev, p])}
                />} />

                <Route path="/cart" element={<Cart
                    cart={cart}
                    onRemove={(idx) => setCart(prev => prev.filter((_, i) => i !== idx))}
                    onCheckout={handleCheckout}
                />} />

                <Route path="/product/:id" element={<ProductDetailsWrapper
                    user={user}
                    onAddToCart={(p) => setCart(prev => [...prev, p])}
                    refreshList={() => setRefreshKey(k => k+1)}
                />} />
            </Routes>

            {/* --- WARSTWA MODALI (Renderowanie warunkowe) --- */}
            {activeModal === 'login' && (
                <Login
                    onLoginSuccess={(u) => { setUser(u); setActiveModal(null); }}
                    onCancel={() => setActiveModal(null)}
                    isModal={true}
                    onClose={() => setActiveModal(null)}
                    onSwitchToRegister={() => setActiveModal('register')}
                />
            )}

            {activeModal === 'register' && (
                <Register
                    onSwitchToLogin={() => setActiveModal('login')}
                    onCancel={() => setActiveModal(null)}
                    isModal={true}
                    onClose={() => setActiveModal(null)}
                />
            )}
        </div>
    );
}
