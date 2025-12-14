import { useEffect, useState } from "react";

const BASE = "http://localhost:8080/api";

export default function Top10Products({ onSelect, onAddToCart }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${BASE}/products/top10`, { credentials: "include" })
            .then(res => {
                if (!res.ok) throw new Error("Nie udało się pobrać Top 10");
                return res.json();
            })
            .then(data => setProducts(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Ładowanie Top 10…</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <div style={{ marginBottom: 30 }}>
            <h2>Top 10 najczęściej kupowanych</h2>

            <ul style={{ listStyle: "none", padding: 0 }}>
                {products.map((p, index) => (
                    <li
                        key={p.id}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 0",
                            borderBottom: "1px solid #444"
                        }}
                    >
                        <span>
                            <b>{index + 1}.</b>{" "}
                            {p.name} — <b>{p.price} zł</b>
                            <span style={{ marginLeft: 10, color: "#aaa" }}>
                                (kupiono {p.sales}×)
                            </span>
                        </span>

                        <span>
                            <button
                                onClick={() => onSelect(p.id)}
                                style={{ marginRight: 8 }}
                            >
                                Podgląd
                            </button>
                            <button
                                onClick={() => onAddToCart(p)}
                                style={{
                                    backgroundColor: "#4a4",
                                    color: "white"
                                }}
                            >
                                Dodaj
                            </button>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
