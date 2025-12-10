import { useState } from 'react';

function Login({ onSwitchToRegister, onLoginSuccess }) {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [msg, setMsg] = useState('');

    const handleLogin = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // <--- IMPORTANT: Allows browser to save the cookie
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setMsg("✅ Zalogowano!");

                setTimeout(() => onLoginSuccess({
                    username: data.username,
                    isAdmin: data.isAdmin
                }), 1000);

            } else {
                setMsg("⚠️ " + data.message);
            }
        } catch (err) {
            setMsg("Błąd połączenia.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin();
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{ padding: 20, border: '1px solid #ccc', margin: '20px auto', maxWidth: 300, background: '#222', color: 'white' }}
        >
            <h3>Logowanie</h3>
            <input placeholder="Login" onChange={e => setFormData({...formData, username: e.target.value})} style={{ marginBottom: 10, padding: 5, width: '90%' }}/><br/>
            <input type="password" placeholder="Hasło" onChange={e => setFormData({...formData, password: e.target.value})} style={{ marginBottom: 10, padding: 5, width: '90%' }}/><br/>
            <button type="submit">Zaloguj się</button>
            <p>{msg}</p>
            <button onClick={onSwitchToRegister} type="button" style={{ background: 'none', border: 'none', color: '#88f', cursor: 'pointer', marginTop: 10 }}>Nie mam konta</button>
        </form>
    );
}
export default Login;