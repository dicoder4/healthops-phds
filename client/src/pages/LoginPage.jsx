import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formShake, setFormShake] = useState(false);

  const navigate = useNavigate(); // 👈 Use navigate from React Router

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const username = e.target.username.value;
  const password = e.target.password.value;

  console.log("[LOGIN] Submitting form");
  console.log("[LOGIN] Username:", username);
  console.log("[LOGIN] Password:", password);

  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log("[LOGIN] Response status:", response.status);
    console.log("[LOGIN] Response data:", data);

if (data.success) {
  navigate('/homePage');
} else {
  setErrorMessage(data.message || 'Login failed');
  setFormShake(true);
  if (navigator.vibrate) navigator.vibrate(200);
}


  } catch (error) {
    console.error("[LOGIN] Request failed:", error);
    setErrorMessage('Server error');
    setFormShake(true);
    if (navigator.vibrate) navigator.vibrate(200);
  }
};



  useEffect(() => {
    if (formShake) {
      const timeout = setTimeout(() => setFormShake(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [formShake]);

  return (
    <section>
      <div className="leaves">
        <div className="set">
          <div><img src="/images/leaf_01.png" alt="Leaf" /></div>
          <div><img src="/images/leaf_03.png" alt="Leaf" /></div>
          <div><img src="/images/leaf_01.png" alt="Leaf" /></div>
          <div><img src="/images/leaf_04.png" alt="Leaf" /></div>
          <div><img src="/images/leaf_01.png" alt="Leaf" /></div>
          <div><img src="/images/leaf_01.png" alt="Leaf" /></div>
          <div><img src="/images/leaf_03.png" alt="Leaf" /></div>
          <div><img src="/images/leaf_04.png" alt="Leaf" /></div>
        </div>
      </div>

      <img src="/images/bg2.jpg" className="bg" alt="Background" />
      <img src="/images/girl.png" className="girl" alt="Girl" />
      <img src="/images/tree.png" className="trees" alt="Trees" />

      <div className="login">
        <h2>Sign In</h2>
        <form
          id="loginForm"
          onSubmit={handleSubmit}
          className={formShake ? 'shake' : ''}
        >
          <div className="inputBox">
            <input type="text" name="username" placeholder="Username" required />
          </div>
          <div className="inputBox password-container">
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              id="password"
              placeholder="Password"
              required
            />
            <span
              className="toggle-password"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? '🙈' : '👁️'}
            </span>
          </div>
          <div className="inputBox">
            <input type="submit" value="Login" id="btn" />
          </div>
        </form>

        <div className="group">
          <a href="/register">No account yet? <span className="register-link">Register Now</span></a>
        </div>

        {errorMessage && (
          <p className="error-message" style={{ color: 'red' }}>
            {errorMessage}
          </p>
        )}
      </div>
      <style jsx>{`

.password-container {
  position: relative;
  margin-bottom: 30px; /* move this from input to container */
}

.password-container input {
  width: 100%;
  padding: 15px 45px 15px 20px; /* right side for icon */
  font-size: 1.25em;
  color: #8f2c24;
  border-radius: 5px;
  background: #fff;
  border: none;
  box-sizing: border-box;
  margin-bottom: 0; /* important: remove margin here */
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.3em;
  color: #8f2c24;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}


      /* Resetting default margins, paddings, and box-sizing */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Poppins", sans-serif;
  }
  a {
    text-decoration: none; /* Remove default underline */
    color: #8f2c24; /* Color for the link */
  }
  
  .register-link {
    text-decoration: underline; /* Make "Register Now" always underlined */
  }
  
  a:hover .register-link {
    text-decoration: none; /* Optional: Remove underline on hover, if desired */
  }
  
  
  /* Styling the section container */
  section {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  
  /* Styling the background image */
  section .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
  
  /* Styling the tree images */
  section .trees {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 30%; /* Adjusts the image slightly downward */
 /* Adjust the vertical positioning */
    z-index: 100;
    pointer-events: none;
}

  /* Styling the girl image */
  section .girl {
    position: absolute;
    scale: 0.65;
    pointer-events: none;
    animation: animateGirl 10s linear infinite;
  }
  
  /* Animating the girl image to move left and right */
  @keyframes animateGirl {
    0% {
      transform: translateX(calc(100% + 100vw));
    }
    50% {
      transform: translateX(calc(-100% - 100vw));
    }
    50.01% {
      transform: translateX(calc(-100% - 100vw)) rotateY(180deg);
    }
    100% {
      transform: translateX(calc(100% + 100vw)) rotateY(180deg);
    }
  }
  
  /* Styling the login box */
  .login {
    position: relative;
    padding: 60px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(15px);
    border: 1px solid #fff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    border-right: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 20px;
    width: 500px;
    display: flex;
    flex-direction: column;
    gap: 30px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  }
  
  /* Styling the heading of the login box */
  .login h2 {
    text-align: center;
    font-size: 2.5em;
    font-weight: 600;
    color: #8f2c24;
    margin-bottom: 10px;
  }
  
  /* Styling the input boxes */
  .login .inputBox {
    position: relative;
  }
  
  .login .inputBox input {
    width: 100%;
    padding: 15px 20px;
    font-size: 1.25em;
    color: #8f2c24;
    border-radius: 5px;
    background: #fff;
    border: none;
    margin-bottom: 30px;
  }
  
  .login .inputBox ::placeholder {
    color: #8f2c24;
  }
  
  /* Styling the login button */
  .login .inputBox #btn {
    border: none;
    background: #8f2c24;
    color: #fff;
    cursor: pointer;
    font-size: 1.25em;
    font-weight: 500;
    transition: 0.5s;
  }
  
  .login .inputBox #btn:hover {
    background: #d64c42;
  }
  
  /* Styling the links under the login form */
  .login .group {
    display: flex;
    justify-content: space-between;
  }
  
  .login .group a {
    font-size: 1.25em;
    color: #8f2c24;
    font-weight: 500;
    text-decoration: none;
  }
  
  .login .group a:nth-child(2) {
    text-decoration: underline;
  }
  
  /* Leaves animation styling */
  .leaves {
    position: absolute;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    pointer-events: none;
  }
  
  .leaves .set {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
  }
  
  .leaves .set div {
    position: absolute;
    display: block;
  }
  
  /* Animation for leaves */
  .leaves .set div:nth-child(1) {
    left: 20%;
    animation: animate 20s linear infinite;
  }
  
  .leaves .set div:nth-child(2) {
    left: 50%;
    animation: animate 14s linear infinite;
  }
  
  .leaves .set div:nth-child(3) {
    left: 70%;
    animation: animate 12s linear infinite;
  }
  
  .leaves .set div:nth-child(4) {
    left: 5%;
    animation: animate 15s linear infinite;
  }
  
  .leaves .set div:nth-child(5) {
    left: 85%;
    animation: animate 18s linear infinite;
  }
  
  .leaves .set div:nth-child(6) {
    left: 90%;
    animation: animate 12s linear infinite;
  }
  
  .leaves .set div:nth-child(7) {
    left: 15%;
    animation: animate 14s linear infinite;
  }
  
  .leaves .set div:nth-child(8) {
    left: 60%;
    animation: animate 15s linear infinite;
  }
  
  @keyframes animate {
    0% {
      opacity: 0;
      top: -10%;
      transform: translateX(20px) rotate(0deg);
    }
    10% {
      opacity: 1;
    }
    100% {
      top: 110%;
      transform: translateX(20px) rotate(225deg);
    }
  }
  
  
      `}</style>
    </section>
  );
};

export default LoginPage;
