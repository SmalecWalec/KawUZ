import React, { useEffect, useState } from "react";
import { getProductImage } from "./helpers.js";
import { useNavigate } from "react-router-dom";
import "./css/ProductsList.css";

const BASE = "http://localhost:8080/api";

function ProductsList({ onSelect, onAddToCart }) {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${BASE}/products`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleProductClick = (p) => {
        const slug = p.name.toLowerCase().replace(/\s+/g, '-');
        navigate(`/product/${p.id}-${slug}`);
    };

    if (loading) return <div>Ładowanie...</div>;

    return (
        <div className="products-container">
            <h2>Lista Ofert (Kawa)</h2>

            <div className="search-wrapper">
                <input
                    type="text"
                    placeholder="Szukaj..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="search-input"
                />
            </div>

            <ul className="products-ul">
                {filteredProducts.map(p => (
                    <li
                        key={p.id}
                        className="productElement"
                        onClick={() => handleProductClick(p)} // Używamy nawigacji
                    >
                        {/* Zdjęcie (33% szerokości) */}
                        <div className="img-container">
                            <img
                                src={getProductImage(p.name)}
                                alt={p.name}
                            />
                        </div>

                        {/* Info (Środek) */}
                        <div className="content-info">
                            <h3 className="name">{p.name}</h3>
                            <p className="description">
                                {p.description || "Brak opisu produktu."}
                            </p>
                        </div>

                        {/* Akcje (Prawa strona) */}
                        <div className="actions-section">
                            <h5>
                                {p.stockQuantity >= 1 ? "TOWAR DOSTĘPNY NA MAGAZYNIE" : "TOWAR NIEDOSTĘPNY"}
                            </h5>

                            <div className="price-row">
                                <b className="price">{p.price} zł</b>
                                <p className="description">brutto</p>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Ważne: zatrzymuje kliknięcie, by nie otwierać produktu
                                    onAddToCart(p);
                                }}
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

export default ProductsList;