import { useState, useEffect } from 'react';

function Register({ onSwitchToLogin }) {
    const [formData, setFormData] = useState({ username: '', password: '', email: '' });
    const [captcha, setCaptcha] = useState({ question: '', answer: 0 });
    const [userCaptcha, setUserCaptcha] = useState('');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const a = Math.floor(Math.random() * 10);
        const b = Math.floor(Math.random() * 10);
        setCaptcha({ question: `${a} + ${b}`, answer: a + b });
    }, []);

    const handleRegister = async () => {
        if (parseInt(userCaptcha) !== captcha.answer) {
            setMsg("❌ Błąd: Zły wynik działania!");
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setMsg("✅ " + data.message);
                setFormData({ username: '', password: '', email: '' });
                setUserCaptcha('');
            } else {
                setMsg("⚠️ " + data.message);
            }
        } catch (err) {
            setMsg("Błąd połączenia z serwerem.");
        }
    };

    return (
        <div style={{ padding: 20, border: '1px solid #ccc', margin: '20px auto', maxWidth: 300, background: '#222', color: 'white' }}>
            <h3>Rejestracja</h3>
            <input placeholder="Login" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={s.input}/><br/>
            <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={s.input}/><br/>
            <input type="password" placeholder="Hasło" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={s.input}/><br/>

            {/* CAPTCHA */}
            <div style={{ margin: '10px 0', padding: 5, background: '#444' }}>
                <label>Ile to jest: <b>{captcha.question}</b> ? </label>
                <input type="number" style={{ width: 50, marginLeft: 10 }} value={userCaptcha} onChange={e => setUserCaptcha(e.target.value)} />
            </div>

            <button onClick={handleRegister}>Zarejestruj się</button>
            <p>{msg}</p>
            <button onClick={onSwitchToLogin} style={s.link}>Mam już konto</button>
        </div>
    );
}
const s = { input: { marginBottom: 10, padding: 5, width: '90%' }, link: { background: 'none', border: 'none', color: '#88f', cursor: 'pointer', marginTop: 10 } };
export default Register;