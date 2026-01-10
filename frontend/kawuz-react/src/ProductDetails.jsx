import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductImage } from "./helpers.js";
import "./css/ProductDetails.css";

const BASE = "http://localhost:8080/api";

// --- Komponent Formularza Edycji ---
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
            <form onSubmit={submitAsJson} className="update-product-form">
                <label>Nazwa: <input value={name} onChange={e => setName(e.target.value)} /></label>
                <label>Cena: <input value={price} onChange={e => setPrice(e.target.value)} /></label>
                <label>Opis:<br />
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} cols={30} />
                </label>
                <button type="submit">Zapisz zmiany</button>
            </form>
            <div className="status-message">{msg}</div>
        </div>
    );
}

// --- Główny Komponent Szczegółów ---
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

    const downloadPdf = () => {
            window.location.href = `${BASE}/product/${product.id}/pdf`;
    };

    if (loading) return <div className="status-message">Ładowanie szczegółów...</div>;
    if (message && !product) return <div className="error-message">Błąd: {message}</div>;
    if (!product) return null;

    return (
        <div className="product-details-container">
            <h3 className="product-details-title">Szczegóły produktu</h3>
            <div className="product-card-flex product-card">
                <div className="product-image-wrapper">
                    <img src={getProductImage(product.name)} alt={product.name} />
                </div>

                <div className="product-info-wrapper">
                    <h4 className="product-info-name">{product.name}</h4>
                    <p className="product-info-desc">{product.description}</p>
                    <b className="product-info-price">{product.price} zł</b>

                    {!isEditable && (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button onClick={() => onAddToCart(product)} className="btn-primary">
                                Dodaj do koszyka
                            </button>

                            <button onClick={downloadPdf} className="btn-primary" style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}>
                                Pobierz PDF
                            </button>
                        </div>
                    )}

                    {product.map && (
                        <div className="map-section">
                            <h4 className="product-details-title">Miejsce pochodzenia</h4>
                            <iframe
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyB2NIWI3Tv9iDPrlnowr_0ZqZWoAQydKJU&q=$$${product.map}&maptype=roadmap`}
                                width="50%"
                                height="150px"
                                className="map-iframe"
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    )}
                </div>
            </div>

            {isEditable && (
                <>
                    <hr className="separator"/>
                    <UpdateProductForm
                        product={product}
                        onUpdate={(msg) => { setMessage(msg); refreshList?.(); }}
                    />
                    <hr className="separator"/>
                    <button onClick={deleteProduct} className="btn-danger">
                        Usuń produkt
                    </button>
                </>
            )}
            <div className="status-message">{message}</div>
        </div>
    );
}

export default function ProductDetailsWrapper({ user, onAddToCart, refreshList }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const realId = id ? id.split('-')[0] : null;

    return (
        <ProductDetails
            id={realId}
            onBack={() => navigate(-1)}
            onAddToCart={onAddToCart}
            refreshList={refreshList}
            isEditable={user?.isAdmin}
        />
    );
}