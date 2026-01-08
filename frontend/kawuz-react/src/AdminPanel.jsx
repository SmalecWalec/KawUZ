// src/AdminPanel.jsx

import React, { useState, useEffect } from 'react';
import ProductForm from './ProductForm';

const BASE = "http://localhost:8080/api";

function AdminPanel({ forceRefresh, onEdit}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [refreshListKey, setRefreshListKey] = useState(0);

    const fetchProducts = () => {
        setLoading(true);
        setErr(null);
        fetch(`${BASE}/products`)
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
    }, [refreshListKey]);

    const handleDelete = async (id) => {
        if (!window.confirm("Czy na pewno usunąć ten produkt?")) return;
        try {
            const res = await fetch(`${BASE}/product/${id}`, { method: "DELETE" });
            const text = await res.text();
            if (res.ok) {
                alert("Produkt usunięty: " + text);
                setRefreshListKey(k => k + 1);
                forceRefresh?.();
            } else {
                alert(`Błąd: ${text}`);
            }
        } catch (e) {
            alert(`Błąd: ${e.message}`);
        }
    };

    const handleProductSaved = () => {
        setRefreshListKey(k => k + 1);
    };


    if (loading) return <div>Ładowanie produktów administracyjnych...</div>;
    if (err) return <div style={{ color: "red" }}>Błąd ładowania: {err}</div>;

    return (
        <div>
            <hr />
            <center>
            <ProductForm onProductSaved={handleProductSaved} initialProduct={{}} />
            </center>
            <hr />
            <h2>Zarządzanie Produktami</h2>
            <table border="1" cellPadding="10" style={{ width: '100%' }}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nazwa</th>
                    <th>Cena</th>
                    <th>Stan</th>
                    <th>Akcje</th>
                </tr>
                </thead>
                <tbody>
                {products.length === 0 ? (
                    <tr><td colSpan="5">Brak produktów do wyświetlenia.</td></tr>
                ) : (
                    products.map(p => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.name}</td>
                            <td>{p.price} zł</td>
                            <td>{p.stockQuantity} szt.</td>
                            <td>
                                <button onClick={() => onEdit(p.id)} style={{ marginRight: 10 }}>
                                    Edytuj
                                </button>
                                <button onClick={() => handleDelete(p.id)} className="delete-btn">
                                    Usuń
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}
export default AdminPanel;
