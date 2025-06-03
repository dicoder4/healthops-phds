import React, { useLayoutEffect, useState } from 'react';
import '../styles/register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
    minLength: false
  });
  const [gmailValid, setGmailValid] = useState(true);
  const [usernameValid, setUsernameValid] = useState(true);
  const [usernameRequirements, setUsernameRequirements] = useState({
    minLength: false,
    maxLength: false,
    noSpaces: false,
    validChars: false
  });

  useLayoutEffect(() => {
    document.body.classList.add('register-page');
    return () => {
      document.body.classList.remove('register-page');
    };
  }, []);

  // Password visibility toggles
  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible((prev) => !prev);
  };

  // Username validation
  const validateUsername = (username) => {
    const requirements = {
      minLength: username.length >= 3,
      maxLength: username.length <= 20,
      noSpaces: !/\s/.test(username),
      validChars: /^[a-zA-Z0-9_.-]+$/.test(username)
    };
    setUsernameRequirements(requirements);
    return Object.values(requirements).every(Boolean);
  };

  // Gmail validation
  const validateGmail = (gmail) => {
    const gmailRegex = /^[^\s@]+@gmail\.com$/;
    return gmailRegex.test(gmail);
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const strength = {
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      minLength: password.length >= 8
    };
    setPasswordStrength(strength);
    return Object.values(strength).every(Boolean);
  };

  const handleUsernameChange = (e) => {
    const usernameValue = e.target.value;
    setUsername(usernameValue);
    setUsernameValid(validateUsername(usernameValue));
  };

  const handleGmailChange = (e) => {
    const gmailValue = e.target.value;
    setGmail(gmailValue);
    setGmailValid(validateGmail(gmailValue) || gmailValue === '');
  };

  const handlePasswordChange = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);
    checkPasswordStrength(passwordValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate username
    if (!validateUsername(username)) {
      setMessage('Username does not meet all requirements');
      return;
    }

    // Validate gmail if provided
    if (gmail && !validateGmail(gmail)) {
      setMessage('Please enter a valid Gmail address (must end with @gmail.com)');
      return;
    }

    // Check password strength
    if (!checkPasswordStrength(password)) {
      setMessage('Password does not meet all requirements');
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, gmail: gmail || undefined, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('Registered successfully! Redirecting to login...');
      setTimeout(() => window.location.href = '/', 2000);
    } else {
      setMessage(data.message || 'Registration failed');
    }
  };

  const getValidationColor = (isValid) => {
    return isValid ? '#4CAF50' : '#f44336';
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
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={handleUsernameChange}
              style={{ borderColor: usernameValid ? '' : '#f44336' }}
              required 
            />
          </div>
          
          {/* Username Requirements */}
          {username && (
            <div className="username-requirements" style={{ fontSize: '12px', marginBottom: '10px' }}>
              <div style={{ color: getValidationColor(usernameRequirements.minLength) }}>
                ✓ At least 3 characters
              </div>
              <div style={{ color: getValidationColor(usernameRequirements.maxLength) }}>
                ✓ Maximum 20 characters
              </div>
              <div style={{ color: getValidationColor(usernameRequirements.noSpaces) }}>
                ✓ No spaces allowed
              </div>
              <div style={{ color: getValidationColor(usernameRequirements.validChars) }}>
                ✓ Only letters, numbers, underscore, dot, and dash allowed
              </div>
            </div>
          )}
          
          <div className="inputBox">
            <input 
              type="email" 
              placeholder="Gmail (optional)" 
              value={gmail} 
              onChange={handleGmailChange}
              style={{ borderColor: gmailValid ? '' : '#f44336' }}
            />
            {!gmailValid && <small style={{ color: '#f44336' }}>Please enter a valid Gmail address</small>}
          </div>
          
          {/* Password Input with Eye Toggle */}
          <div className="inputBox">
            <div className="password-container">
              <input 
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Password" 
                value={password} 
                onChange={handlePasswordChange}
                required 
              />
              <span
                className="toggle-password"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? '🙈' : '👁️'}
              </span>
            </div>
          </div>
          
          {/* Password Requirements */}
          {password && (
            <div className="password-requirements" style={{ fontSize: '12px', marginBottom: '10px' }}>
              <div style={{ color: getValidationColor(passwordStrength.minLength) }}>
                ✓ At least 8 characters
              </div>
              <div style={{ color: getValidationColor(passwordStrength.hasUpperCase) }}>
                ✓ At least one uppercase letter (A-Z)
              </div>
              <div style={{ color: getValidationColor(passwordStrength.hasLowerCase) }}>
                ✓ At least one lowercase letter (a-z)
              </div>
              <div style={{ color: getValidationColor(passwordStrength.hasNumbers) }}>
                ✓ At least one number (0-9)
              </div>
              <div style={{ color: getValidationColor(passwordStrength.hasSpecialChar) }}>
                ✓ At least one special character (!@#$%^&*)
              </div>
            </div>
          )}
          
          {/* Confirm Password Input with Eye Toggle */}
          <div className="inputBox">
            <div className="password-container">
              <input 
                type={confirmPasswordVisible ? 'text' : 'password'}
                placeholder="Confirm Password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ borderColor: password && confirmPassword && password !== confirmPassword ? '#f44336' : '' }}
                required 
              />
              <span
                className="toggle-password"
                onClick={toggleConfirmPasswordVisibility}
              >
                {confirmPasswordVisible ? '🙈' : '👁️'}
              </span>
            </div>
            {password && confirmPassword && password !== confirmPassword && 
              <small style={{ color: '#f44336' }}>Passwords do not match</small>
            }
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