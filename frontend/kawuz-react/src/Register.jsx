import React, { useState, useEffect } from "react";
import "./css/Login.css";

const BASE = "http://localhost:8080/api";

export default function Register({ onSwitchToLogin, onCancel, isModal = false, onClose }) {
    const [formData, setFormData] = useState({ username: '', password: '', email: '' });
    const [captcha, setCaptcha] = useState({ question: '', answer: 0 });
    const [userCaptcha, setUserCaptcha] = useState('');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const a = Math.floor(Math.random() * 10);
        const b = Math.floor(Math.random() * 10);
        setCaptcha({ question: `${a} + ${b}`, answer: a + b });
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (parseInt(userCaptcha) !== captcha.answer) {
            setMsg("❌ Błąd: Zły wynik!");
            return;
        }

        try {
            const res = await fetch(`${BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setMsg("✅ Zarejestrowano!");
                setTimeout(() => onSwitchToLogin(), 1500);
            } else {
                setMsg("⚠️ " + (data.message || "Błąd rejestracji."));
            }
        } catch (err) {
            setMsg("Błąd połączenia.");
        }
    };

    const handleOverlayClick = (e) => {
        if (isModal && e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };

    const formContent = (
        <form onSubmit={handleRegister} className="auth-card">
            <h3>Rejestracja</h3>
            <input
                placeholder="Login"
                required
                onChange={e => setFormData({...formData, username: e.target.value})}
                value={formData.username}
            />
            <input
                type="email"
                placeholder="Email"
                required
                onChange={e => setFormData({...formData, email: e.target.value})}
                value={formData.email}
            />
            <input
                type="password"
                placeholder="Hasło"
                required
                onChange={e => setFormData({...formData, password: e.target.value})}
                value={formData.password}
            />

            <div className="captcha-container">
                <label>Ile to jest: <b>{captcha.question}</b> ?</label>
                <input
                    type="number"
                    style={{ width: '60px', marginLeft: '10px', marginBottom: 0 }}
                    value={userCaptcha}
                    onChange={e => setUserCaptcha(e.target.value)}
                    required
                />
            </div>

            <button type="submit">Zarejestruj się</button>
            <button type="button" onClick={isModal ? onClose : onCancel}>Anuluj</button>

            <p>{msg}</p>

            <button type="button" onClick={onSwitchToLogin} className="switch-login">
                Mam już konto
            </button>
        </form>
    );

    if (isModal) {
        return (
            <div className="modal-overlay" onClick={handleOverlayClick}>
                {formContent}
            </div>
        );
    }

    return formContent;
}