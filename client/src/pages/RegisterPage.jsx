import React, { useLayoutEffect, useState } from 'react';
import '../styles/register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useLayoutEffect(() => {
    document.body.classList.add('register-page');
    return () => {
      document.body.classList.remove('register-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('Registered successfully! Redirecting to login...');
      setTimeout(() => window.location.href = '/login', 2000); // or use React Router
    } else {
      setMessage(data.message || 'Registration failed');
    }
  };

  return (
    <>
      <img src="images/bg3.jpg" className="bg" alt="Background" />
      <div className="leaves">
        <div><img src="/images/leaf_01.png" alt="Leaf" /></div>
        <div><img src="/images/leaf_03.png" alt="Leaf" /></div>
        <div><img src="/images/leaf_01.png" alt="Leaf" /></div>
        <div><img src="/images/leaf_04.png" alt="Leaf" /></div>
        <div><img src="/images/leaf_01.png" alt="Leaf" /></div>
        <div><img src="/images/leaf_01.png" alt="Leaf" /></div>
        <div><img src="/images/leaf_03.png" alt="Leaf" /></div>
        <div><img src="/images/leaf_04.png" alt="Leaf" /></div>
      </div>

      <div className="register">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="inputBox">
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="inputBox">
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="inputBox">
            <button id="btn" type="submit">Register</button>
          </div>
        </form>
        {message && <p style={{ color: 'red' }}>{message}</p>}
      </div>
    </>
  );
};

export default Register;
