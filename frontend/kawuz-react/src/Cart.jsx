// src/Cart.jsx
import React from "react";

export default function Cart({ cart, onRemove, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div>
      <h2>Koszyk</h2>
      {cart.length === 0 ? (
        <div>Koszyk jest pusty</div>
      ) : (
        <ul>
          {cart.map((item, idx) => (
            <li key={idx} style={{ marginBottom: 5 }}>
              {item.name} — {item.price} zł
              <button
                onClick={() => onRemove(idx)}
                style={{ marginLeft: 10, padding: "2px 5px", backgroundColor: "#b33", color: "white" }}>
                Usuń
              </button>
            </li>
          ))}
        </ul>
      )}
      <div><b>Łącznie: {total.toFixed(2)} zł</b></div>
      <button
        onClick={onCheckout}
        style={{ marginTop: 10, padding: "5px 10px", backgroundColor: "#4a4", color: "white" }}
      >
        Złóż zamówienie
      </button>
    </div>
  );
}
