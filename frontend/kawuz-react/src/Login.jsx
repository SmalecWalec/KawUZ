import React, { useState } from "react";
import "./css/Login.css";

const BASE = "http://localhost:8080/api";

export default function Login({ onSwitchToRegister, onLoginSuccess, onCancel, isModal = false, onClose }) {
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
                setMsg("⚠️ " + (data.message || "Błąd logowania."));
            }
        } catch (err) {
            setMsg("Błąd połączenia z serwerem.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin();
    };

    const handleOverlayClick = (e) => {
        // Używamy classList.contains dla większej niezawodności
        if (isModal && e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };

    // --- Uporządkowane Renderowanie ---

    // 1. Definiujemy treść formularza, która jest taka sama niezależnie od tego, czy jest modalem
    const formContent = (
        <LoginFormContent
            handleSubmit={handleSubmit}
            setFormData={setFormData}
            formData={formData}
            // Anuluj w modalu wywołuje onClose, w widoku głównym onCancel
            onCancel={isModal ? onClose : onCancel}
            msg={msg}
            onSwitchToRegister={onSwitchToRegister}
        />
    );

    // 2. Jeśli jest modal, opakowujemy treść w kontener tła
    if (isModal) {
        return (
            <div className="modal-overlay" onClick={handleOverlayClick}>
                {formContent}
            </div>
        );
    }

    // 3. Jeśli nie jest modal, zwracamy sam formularz
    return formContent;
}

// Komponent wewnętrzny dla czystości kodu, zawierający sam formularz (BEZ ZMIAN)
function LoginFormContent({ handleSubmit, setFormData, formData, onCancel, msg, onSwitchToRegister }) {
    return (
        <form onSubmit={handleSubmit} className="auth-card">
            <h3>Logowanie</h3>
            <input
                placeholder="Login"
                onChange={e => setFormData({...formData, username: e.target.value})}
                value={formData.username}
            />
            <br/>
            <input
                type="password"
                placeholder="Hasło"
                onChange={e => setFormData({...formData, password: e.target.value})}
                value={formData.password}
            />
            <br/>
            <button type="submit">Zaloguj się</button>
            <button type="button" onClick={onCancel}>Anuluj</button>
            <p>{msg}</p>
            <button onClick={onSwitchToRegister} type="button" className="switch-register">
                Nie mam konta
            </button>
        </form>
    );
}